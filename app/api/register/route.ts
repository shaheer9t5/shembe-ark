import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    // Connect to MongoDB
    await connectDB();

    // Parse the request body
    const body = await request.json();
    const {
      firstName,
      surname,
      cellphone,
      email,
      address,
      suburb,
      province,
      temple
    } = body;

    // Validate required fields
    if (!firstName || !surname || !cellphone || !address || !suburb || !province || !temple) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user with this cellphone already exists
    const existingUser = await User.findOne({ cellphone });
    if (existingUser) {
      return NextResponse.json(
        { error: 'A user with this cellphone number is already registered' },
        { status: 409 } // Conflict status
      );
    }

    // Create new user
    const newUser = new User({
      firstName: firstName.trim(),
      surname: surname.trim(),
      cellphone: cellphone.replace(/\s/g, ''), // Remove any spaces
      email: email?.trim() || undefined,
      address: address.trim(),
      suburb: suburb.trim(),
      province,
      temple: temple.trim()
    });

    // Save to database
    const savedUser = await newUser.save();

    // Return success response (excluding sensitive data if any)
    return NextResponse.json(
      {
        success: true,
        message: 'Registration successful',
        user: {
          id: savedUser._id,
          firstName: savedUser.firstName,
          surname: savedUser.surname,
          cellphone: savedUser.cellphone,
          temple: savedUser.temple,
          registrationDate: savedUser.registrationDate
        }
      },
      { status: 201 }
    );

  } catch (error: any) {
    console.error('Registration error:', error);

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(
        (err: any) => err.message
      );
      return NextResponse.json(
        { error: 'Validation failed', details: validationErrors },
        { status: 400 }
      );
    }

    // Handle duplicate key errors (e.g., cellphone number already exists)
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'A user with this cellphone number is already registered' },
        { status: 409 }
      );
    }

    // Generic server error
    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 }
    );
  }
}

// Optional: Handle GET requests to retrieve user data (for admin purposes)
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const temple = searchParams.get('temple');
    const province = searchParams.get('province');
    
    // Build query
    let query = {};
    if (temple) query = { ...query, temple: new RegExp(temple, 'i') };
    if (province) query = { ...query, province };
    
    // Get users (limit to 100 for performance)
    const users = await User.find(query)
      .select('-__v') // Exclude version field
      .sort({ registrationDate: -1 })
      .limit(100);

    const totalUsers = await User.countDocuments(query);

    return NextResponse.json({
      success: true,
      users,
      total: totalUsers,
      query
    });

  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
