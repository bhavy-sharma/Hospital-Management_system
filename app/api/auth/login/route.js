import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import jwt from 'jsonwebtoken';

export async function POST(request) {
  try {
    const { email, password } = await request.json();
    console.log('Login attempt:', email);

    // Check for admin credentials from env
    if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
      console.log('Admin credentials matched!');
      
      const token = jwt.sign(
        { email: email, role: 'admin' },
        process.env.JWT_SECRET || 'secret-key',
        { expiresIn: '1h' }
      );

      const response = NextResponse.json({
        success: true,
        message: 'Login successful',
        token,
        user: { email: email, role: 'admin' }
      });

      // Set cookie for middleware
      response.cookies.set('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 3600 // 1 hour
      });

      console.log('Login response:', { success: true, token: token.substring(0, 20) + '...' });
      return response;
    }

    console.log('Invalid credentials for:', email);
    return NextResponse.json(
      { success: false, message: 'Invalid credentials' },
      { status: 401 }
    );

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}