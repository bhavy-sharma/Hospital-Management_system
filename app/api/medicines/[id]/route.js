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

// PUT update medicine stock (dispense or restock)
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { quantity, action } = body;

    // Check if medicine exists
    const existingMedicine = await getMedicineById(id);
    if (!existingMedicine) {
      return NextResponse.json(
        { success: false, message: 'Medicine not found' },
        { status: 404 }
      );
    }

    if (quantity === undefined || quantity === '' || parseInt(quantity) <= 0) {
      return NextResponse.json(
        { success: false, message: 'Valid quantity is required' },
        { status: 400 }
      );
    }

    const qty = parseInt(quantity);
    const currentQty = existingMedicine.quantity;

    // ✅ DISPENSE (Out) - Reduce stock
    if (action === 'dispense') {
      if (qty > currentQty) {
        return NextResponse.json(
          { success: false, message: `Insufficient stock! Available: ${currentQty}` },
          { status: 400 }
        );
      }
      const newQuantity = currentQty - qty;
      await updateMedicineStock(id, newQuantity);
      return NextResponse.json({ 
        success: true, 
        message: `Dispensed ${qty} units of ${existingMedicine.name}. Remaining: ${newQuantity}`
      });
    }

    // ✅ RESTOCK - Add stock
    if (action === 'restock') {
      const newQuantity = currentQty + qty;
      await updateMedicineStock(id, newQuantity);
      return NextResponse.json({ 
        success: true, 
        message: `Restocked ${qty} units of ${existingMedicine.name}. New Stock: ${newQuantity}`
      });
    }

    // Default: Set stock directly
    await updateMedicineStock(id, qty);
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