import { NextResponse } from 'next/server';
import { getAllMedicines, createMedicine } from '@/lib/models/Medicine';

// GET all medicines
export async function GET() {
  try {
    const medicines = await getAllMedicines();
    return NextResponse.json({ 
      success: true, 
      data: medicines 
    });
  } catch (error) {
    console.error('Error fetching medicines:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch medicines' },
      { status: 500 }
    );
  }
}

// POST create new medicine
export async function POST(request) {
  try {
    const body = await request.json();
    const { name, mg, quantity } = body;

    // Validation
    if (!name || !mg || quantity === undefined || quantity === '') {
      return NextResponse.json(
        { success: false, message: 'Name, MG, and quantity are required' },
        { status: 400 }
      );
    }

    const medicineData = {
      name,
      mg,
      quantity: parseInt(quantity)
    };

    const result = await createMedicine(medicineData);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Medicine added successfully',
      data: { id: result.insertedId, ...medicineData }
    });
  } catch (error) {
    console.error('Error creating medicine:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to add medicine' },
      { status: 500 }
    );
  }
}