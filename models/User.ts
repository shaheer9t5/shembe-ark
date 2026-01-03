import mongoose, { Document, Model, Schema } from 'mongoose';

// Interface for the User document
export interface IUser extends Document {
  firstName: string;
  surname: string;
  cellphone: string;
  email?: string;
  address: string;
  suburb: string;
  province: string;
  temple: string;
  registrationDate: Date;
  isActive: boolean;
  emailSent: boolean;
}

// User schema
const UserSchema: Schema = new Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxLength: [50, 'First name cannot exceed 50 characters']
  },
  surname: {
    type: String,
    required: [true, 'Surname is required'],
    trim: true,
    maxLength: [50, 'Surname cannot exceed 50 characters']
  },
  cellphone: {
    type: String,
    required: [true, 'Cellphone number is required'],
    validate: {
      validator: function(v: string) {
        return /^[6-8][0-9]{8}$/.test(v);
      },
      message: 'Please enter a valid South African cellphone number (9 digits starting with 6, 7, or 8)'
    }
  },
  email: {
    type: String,
    required: false,
    trim: true,
    lowercase: true,
    validate: {
      validator: function(v: string) {
        return !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: 'Please enter a valid email address'
    }
  },
  address: {
    type: String,
    required: [true, 'Residential address is required'],
    trim: true,
    maxLength: [200, 'Address cannot exceed 200 characters']
  },
  suburb: {
    type: String,
    required: [true, 'Suburb is required'],
    trim: true,
    maxLength: [100, 'Suburb cannot exceed 100 characters']
  },
  province: {
    type: String,
    required: [true, 'Province is required'],
    enum: [
      'Eastern Cape',
      'Free State',
      'Gauteng',
      'KwaZulu-Natal',
      'Limpopo',
      'Mpumalanga',
      'Northern Cape',
      'North West',
      'Western Cape'
    ]
  },
  temple: {
    type: String,
    required: [true, 'Temple name is required'],
    trim: true,
    maxLength: [100, 'Temple name cannot exceed 100 characters']
  },
  registrationDate: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  emailSent: {
    type: Boolean,
    default: false,
    index: true
  }
}, {
  timestamps: true // Automatically adds createdAt and updatedAt fields
});

// Index for better query performance
UserSchema.index({ cellphone: 1 }, { unique: true });
UserSchema.index({ temple: 1 });
UserSchema.index({ province: 1 });
UserSchema.index({ emailSent: 1, registrationDate: 1 }); // Compound index for efficient unsent queries

// Create and export the model
const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
