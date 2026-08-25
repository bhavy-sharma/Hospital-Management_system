import { NextResponse } from 'next/server';
import { getMedicineById, updateMedicineStock, deleteMedicine } from '@/lib/models/Medicine';

// GET single medicine
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const medicine = await getMedicineById(id);
    
    if (!medicine) {
      return NextResponse.json(
        { success: false, message: 'Medicine not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      data: medicine 
    });
  } catch (error) {
    console.error('Error fetching medicine:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch medicine' },
      { status: 500 }
    );
  }
}

// PUT update medicine stock
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { quantity } = body;

    // Check if medicine exists
    const existingMedicine = await getMedicineById(id);
    if (!existingMedicine) {
      return NextResponse.json(
        { success: false, message: 'Medicine not found' },
        { status: 404 }
      );
    }

    if (quantity === undefined || quantity === '') {
      return NextResponse.json(
        { success: false, message: 'Quantity is required' },
        { status: 400 }
      );
    }

    // For dispensing (out medicine), check if sufficient stock
    if (body.action === 'dispense') {
      const newQuantity = existingMedicine.quantity - parseInt(quantity);
      if (newQuantity < 0) {
        return NextResponse.json(
          { success: false, message: `Insufficient stock! Available: ${existingMedicine.quantity}` },
          { status: 400 }
        );
      }
      await updateMedicineStock(id, newQuantity);
      return NextResponse.json({ 
        success: true, 
        message: `Dispensed ${quantity} ${existingMedicine.name} successfully`
      });
    }

    // For updating stock directly
    await updateMedicineStock(id, quantity);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Medicine stock updated successfully'
    });
  } catch (error) {
    console.error('Error updating medicine:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update medicine' },
      { status: 500 }
    );
  }
}

// DELETE medicine
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    
    // Check if medicine exists
    const existingMedicine = await getMedicineById(id);
    if (!existingMedicine) {
      return NextResponse.json(
        { success: false, message: 'Medicine not found' },
        { status: 404 }
      );
    }

    await deleteMedicine(id);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Medicine deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting medicine:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete medicine' },
      { status: 500 }
    );
  }
}