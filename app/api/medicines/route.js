import { NextResponse } from 'next/server';
import { getAllMembers, createMember, getMembersByRole, searchMembers } from '@/lib/models/Member';

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

export async function POST(request) {
  try {
    const body = await request.json();
    const { 
      name, role, 
      specialization, experience, qualification,
      disease, bloodGroup, age, gender,
      staffType,
      details, phone, email, address 
    } = body;

    if (!name || !role) {
      return NextResponse.json(
        { success: false, message: 'Name and role are required' },
        { status: 400 }
      );
    }

    // Role-specific validation
    if (role === 'Doctor' && !specialization) {
      return NextResponse.json(
        { success: false, message: 'Specialization is required for doctors' },
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
      specialization: role === 'Doctor' ? specialization : 'N/A',
      experience: role === 'Doctor' ? (experience || '') : 'N/A',
      qualification: role === 'Doctor' ? (qualification || '') : 'N/A',
      disease: role === 'Patient' ? (disease || '') : 'N/A',
      bloodGroup: role === 'Patient' ? (bloodGroup || '') : 'N/A',
      age: role === 'Patient' ? (age || '') : 'N/A',
      gender: role === 'Patient' ? (gender || '') : 'N/A',
      staffType: role === 'Staff' ? staffType : 'N/A',
      details: details || '',
      phone: phone || '',
      email: email || '',
      address: address || '',
      createdAt: new Date(),
      updatedAt: new Date()
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