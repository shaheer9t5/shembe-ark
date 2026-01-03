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
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const skip = (page - 1) * limit;
    const unsentOnly = searchParams.get('unsentOnly') === 'true';
    
    // Build search query
    let query: any = {};
    if (search) {
      // Escape special regex characters to prevent errors
      const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const searchRegex = new RegExp(escapedSearch, 'i');
      query = {
        $or: [
          { firstName: searchRegex },
          { surname: searchRegex },
          { cellphone: searchRegex },
          { email: searchRegex },
          { address: searchRegex },
          { suburb: searchRegex },
          { province: searchRegex },
          { temple: searchRegex }
        ]
      };
    }
    
    // Filter for unsent registrations if requested
    if (unsentOnly) {
      query.emailSent = { $ne: true };
      query.isActive = true;
    }
    
    // Get total count for pagination
    const totalUsers = await User.countDocuments(query);
    
    // Get paginated users
    const users = await User.find(query)
      .select('-__v') // Exclude version field
      .sort({ registrationDate: -1 })
      .skip(skip)
      .limit(limit)
      .lean(); // Use lean() for better performance

    // Convert _id and dates to strings for JSON serialization
    const formattedUsers = users.map((user: any) => ({
      ...user,
      _id: user._id.toString(),
      registrationDate: user.registrationDate.toISOString(),
      sentAt: user.sentAt ? user.sentAt.toISOString() : undefined
    }));

    const totalPages = Math.ceil(totalUsers / limit);

    return NextResponse.json({
      success: true,
      users: formattedUsers,
      total: totalUsers,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    });

  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
