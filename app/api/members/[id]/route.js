import { NextResponse } from 'next/server';
import { getMemberById, updateMember, deleteMember } from '@/lib/models/Member';

// GET single member
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const member = await getMemberById(id);
    
    if (!member) {
      return NextResponse.json(
        { success: false, message: 'Member not found' },
        { status: 404 }
      );
    }
    
    // Format member for frontend
    const formattedMember = {
      ...member,
      _id: member._id.toString(),
      id: member._id.toString()
    };
    
    return NextResponse.json({ 
      success: true, 
      data: formattedMember 
    });
  } catch (error) {
    console.error('Error fetching member:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch member' },
      { status: 500 }
    );
  }
}

// PUT update member
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, role, staffType, details, phone, email, address } = body;

    // Check if member exists
    const existingMember = await getMemberById(id);
    if (!existingMember) {
      return NextResponse.json(
        { success: false, message: 'Member not found' },
        { status: 404 }
      );
    }

    // Validation
    if (!name || !role) {
      return NextResponse.json(
        { success: false, message: 'Name and role are required' },
        { status: 400 }
      );
    }

    if (role === 'Staff' && !staffType) {
      return NextResponse.json(
        { success: false, message: 'Staff type is required for staff members' },
        { status: 400 }
      );
    }

    const updateData = {
      name,
      role,
      staffType: role === 'Staff' ? staffType : 'N/A',
      details: details || '',
      phone: phone || '',
      email: email || '',
      address: address || ''
    };

    await updateMember(id, updateData);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Member updated successfully'
    });
  } catch (error) {
    console.error('Error updating member:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update member' },
      { status: 500 }
    );
  }
}

// DELETE member
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    
    // Check if member exists
    const existingMember = await getMemberById(id);
    if (!existingMember) {
      return NextResponse.json(
        { success: false, message: 'Member not found' },
        { status: 404 }
      );
    }

    await deleteMember(id);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Member deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting member:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete member' },
      { status: 500 }
    );
  }
}