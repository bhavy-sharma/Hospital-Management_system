import { NextResponse } from 'next/server';
import { getAllExpenses, createExpense, getTotalExpenses, getExpensesByType } from '@/lib/models/Expense';
import { getMemberById } from '@/lib/models/Member';

// GET all expenses
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    
    let expenses;
    if (type) {
      expenses = await getExpensesByType(type);
    } else {
      expenses = await getAllExpenses();
    }
    
    const total = await getTotalExpenses();
    
    return NextResponse.json({ 
      success: true, 
      data: expenses,
      total: total
    });
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch expenses' },
      { status: 500 }
    );
  }
}

// POST create new expense
export async function POST(request) {
  try {
    const body = await request.json();
    const { type, staffId, amount, description } = body;

    if (!type || !amount) {
      return NextResponse.json(
        { success: false, message: 'Type and amount are required' },
        { status: 400 }
      );
    }

    let staffName = 'N/A';
    let staffDetails = null;

    // ✅ Salary: Doctor ya Staff dono handle karo
    if (type === 'Salary') {
      if (!staffId) {
        return NextResponse.json(
          { success: false, message: 'Member is required for salary expense' },
          { status: 400 }
        );
      }
      
      try {
        const member = await getMemberById(staffId);
        if (member) {
          staffName = member.name;
          staffDetails = {
            id: member._id,
            name: member.name,
            role: member.role,                               // ✅ Doctor / Staff
            staffType: member.staffType || 'N/A',            // ✅ For Staff
            specialization: member.specialization || 'N/A'   // ✅ For Doctor
          };
        } else {
          return NextResponse.json(
            { success: false, message: 'Member not found' },
            { status: 404 }
          );
        }
      } catch (error) {
        console.error('Error fetching member:', error);
        return NextResponse.json(
          { success: false, message: 'Error fetching member details' },
          { status: 500 }
        );
      }
    }

    const expenseData = {
      type,
      staffId: type === 'Salary' ? staffId : null,
      staffName: type === 'Salary' ? staffName : 'N/A',
      staffDetails: type === 'Salary' ? staffDetails : null,
      amount: parseFloat(amount),
      description: description || '',
      date: new Date()
    };

    const result = await createExpense(expenseData);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Expense added successfully',
      data: { id: result.insertedId, ...expenseData }
    });
  } catch (error) {
    console.error('Error creating expense:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to add expense' },
      { status: 500 }
    );
  }
}