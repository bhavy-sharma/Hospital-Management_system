import { NextResponse } from 'next/server';
import { getExpenseById, deleteExpense } from '@/lib/models/Expense';

// GET single expense
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const expense = await getExpenseById(id);
    
    if (!expense) {
      return NextResponse.json(
        { success: false, message: 'Expense not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      data: expense 
    });
  } catch (error) {
    console.error('Error fetching expense:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch expense' },
      { status: 500 }
    );
  }
}

// DELETE expense
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    
    // Check if expense exists
    const existingExpense = await getExpenseById(id);
    if (!existingExpense) {
      return NextResponse.json(
        { success: false, message: 'Expense not found' },
        { status: 404 }
      );
    }

    await deleteExpense(id);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Expense deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting expense:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete expense' },
      { status: 500 }
    );
  }
}