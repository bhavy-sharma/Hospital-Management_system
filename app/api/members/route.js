import { NextResponse } from 'next/server';
import { getAllMembers, createMember } from '@/lib/models/Member';

// GET all members
export async function GET() {
  try {
    const members = await getAllMembers();
    return NextResponse.json({ 
      success: true, 
      data: members 
    });
  } catch (error) {
    console.error('Error fetching members:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch members' },
      { status: 500 }
    );
  }
}

// POST create new member
export async function POST(request) {
  try {
    const body = await request.json();
    const { name, role, staffType } = body;

    // Validation
    if (!name || !role) {
      return NextResponse.json(
        { success: false, message: 'Name and role are required' },
        { status: 400 }
      );
    }

    // For staff, staffType is required
    if (role === 'Staff' && !staffType) {
      return NextResponse.json(
        { success: false, message: 'Staff type is required for staff members' },
        { status: 400 }
      );
    }

    const memberData = {
      name,
      role,
      staffType: role === 'Staff' ? staffType : 'N/A'
    };

    const result = await createMember(memberData);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Member created successfully',
      data: { id: result.insertedId, ...memberData }
    });
  } catch (error) {
    console.error('Error creating member:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create member' },
      { status: 500 }
    );
  }
}