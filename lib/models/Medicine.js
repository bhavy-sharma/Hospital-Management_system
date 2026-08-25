import clientPromise from '../mongodb';

export async function getMedicinesCollection() {
  const client = await clientPromise;
  const db = client.db('hospital_management');
  return db.collection('medicines');
}

export async function getAllMedicines() {
  const collection = await getMedicinesCollection();
  return collection.find({}).sort({ name: 1 }).toArray();
}

export async function getMedicineById(id) {
  const collection = await getMedicinesCollection();
  const { ObjectId } = require('mongodb');
  return collection.findOne({ _id: new ObjectId(id) });
}

export async function createMedicine(medicineData) {
  const collection = await getMedicinesCollection();
  const result = await collection.insertOne({
    ...medicineData,
    quantity: parseInt(medicineData.quantity) || 0,
    createdAt: new Date(),
    updatedAt: new Date()
  });
  return result;
}

export async function updateMedicineStock(id, newQuantity) {
  const collection = await getMedicinesCollection();
  const { ObjectId } = require('mongodb');
  const result = await collection.updateOne(
    { _id: new ObjectId(id) },
    { 
      $set: {
        quantity: parseInt(newQuantity),
        updatedAt: new Date()
      }
    }
  );
  return result;
}

export async function deleteMedicine(id) {
  const collection = await getMedicinesCollection();
  const { ObjectId } = require('mongodb');
  const result = await collection.deleteOne({ _id: new ObjectId(id) });
  return result;
}