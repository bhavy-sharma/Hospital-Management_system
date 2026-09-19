import { NextResponse } from 'next/server';
import { getMemberById, updateMember, deleteMember } from '@/lib/models/Member';

// GET single member
export async function GET(request, { params }) {
  try {
    // ✅ await params
    const { id } = await params;
    const member = await getMemberById(id);
    
    if (!member) {
      return NextResponse.json(
        { success: false, message: 'Member not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      data: {
        ...member,
        _id: member._id.toString(),
        id: member._id.toString()
      }
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
    // ✅ await params - MOST IMPORTANT FIX
    const { id } = await params;
    
    console.log('PUT Request ID:', id); // Debug log
    
    const body = await request.json();
    console.log('PUT Body:', body); // Debug log

    // Check if member exists
    const existingMember = await getMemberById(id);
    if (!existingMember) {
      return NextResponse.json(
        { success: false, message: 'Member not found' },
        { status: 404 }
      );
    }

    // Validation
    if (!body.name || !body.role) {
      return NextResponse.json(
        { success: false, message: 'Name and role are required' },
        { status: 400 }
      );
    }

    // ✅ Prepare update data (only fields that should be updated)
    const updateData = {
      name: body.name,
      role: body.role,
      specialization: body.specialization || 'N/A',
      experience: body.experience || 'N/A',
      qualification: body.qualification || 'N/A',
      disease: body.disease || 'N/A',
      bloodGroup: body.bloodGroup || 'N/A',
      age: body.age || 'N/A',
      gender: body.gender || 'N/A',
      staffType: body.staffType || 'N/A',
      details: body.details || '',
      phone: body.phone || '',
      email: body.email || '',
      address: body.address || ''
    };

    console.log('Update Data:', updateData); // Debug log

    const result = await updateMember(id, updateData);
    
    console.log('Update Result:', result); // Debug log

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, message: 'Member not found or not updated' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Member updated successfully',
      data: updateData
    });
  } catch (error) {
    console.error('Error updating member:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update member: ' + error.message },
      { status: 500 }
    );
  }
}

// DELETE member
export async function DELETE(request, { params }) {
  try {
    // ✅ await params
    const { id } = await params;
    
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