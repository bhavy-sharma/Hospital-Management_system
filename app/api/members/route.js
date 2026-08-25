import { NextResponse } from 'next/server';
import { getAllMembers, createMember, getMembersByRole, searchMembers } from '@/lib/models/Member';

// GET all members
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const search = searchParams.get('search');
    
    let members;
    if (search) {
      members = await searchMembers(search);
    } else if (role) {
      members = await getMembersByRole(role);
    } else {
      members = await getAllMembers();
    }
    
    // Format members for frontend
    const formattedMembers = members.map(member => ({
      ...member,
      _id: member._id.toString(),
      id: member._id.toString()
    }));
    
    return NextResponse.json({ 
      success: true, 
      data: formattedMembers 
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
    const { name, role, staffType, details, phone, email, address } = body;

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

    const memberData = {
      name,
      role,
      staffType: role === 'Staff' ? staffType : 'N/A',
      details: details || '',
      phone: phone || '',
      email: email || '',
      address: address || ''
    };

    const result = await createMember(memberData);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Member created successfully',
      data: { 
        id: result.insertedId.toString(), 
        _id: result.insertedId.toString(),
        ...memberData 
      }
    });
  } catch (error) {
    console.error('Error creating member:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create member' },
      { status: 500 }
    );
  }
}