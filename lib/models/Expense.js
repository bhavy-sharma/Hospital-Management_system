import clientPromise from '../mongodb';
import { ObjectId } from 'mongodb';

export async function getExpensesCollection() {
  const client = await clientPromise;
  const db = client.db('hospital_management');
  return db.collection('expenses');
}

export async function getAllExpenses() {
  const collection = await getExpensesCollection();
  return collection.find({}).sort({ date: -1 }).toArray();
}

export async function getExpenseById(id) {
  const collection = await getExpensesCollection();
  return collection.findOne({ _id: new ObjectId(id) });
}

export async function createExpense(expenseData) {
  const collection = await getExpensesCollection();
  const result = await collection.insertOne({
    ...expenseData,
    amount: parseFloat(expenseData.amount),
    date: new Date(),
    createdAt: new Date(),
    updatedAt: new Date()
  });
  return result;
}

export async function deleteExpense(id) {
  const collection = await getExpensesCollection();
  const result = await collection.deleteOne({ _id: new ObjectId(id) });
  return result;
}

export async function getExpensesByType(type) {
  const collection = await getExpensesCollection();
  return collection.find({ type }).sort({ date: -1 }).toArray();
}

export async function getTotalExpenses() {
  const collection = await getExpensesCollection();
  const result = await collection.aggregate([
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]).toArray();
  return result.length > 0 ? result[0].total : 0;
}

export async function getExpensesByDateRange(startDate, endDate) {
  const collection = await getExpensesCollection();
  return collection.find({
    date: { $gte: new Date(startDate), $lte: new Date(endDate) }
  }).sort({ date: -1 }).toArray();
}