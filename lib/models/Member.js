import clientPromise from '../mongodb';

export async function getMembersCollection() {
  const client = await clientPromise;
  const db = client.db('hospital_management');
  return db.collection('members');
}

export async function getAllMembers() {
  const collection = await getMembersCollection();
  return collection.find({}).sort({ createdAt: -1 }).toArray();
}

export async function getMemberById(id) {
  const collection = await getMembersCollection();
  const { ObjectId } = require('mongodb');
  return collection.findOne({ _id: new ObjectId(id) });
}

export async function createMember(memberData) {
  const collection = await getMembersCollection();
  const result = await collection.insertOne({
    ...memberData,
    createdAt: new Date(),
    updatedAt: new Date()
  });
  return result;
}

export async function updateMember(id, memberData) {
  const collection = await getMembersCollection();
  const { ObjectId } = require('mongodb');
  const result = await collection.updateOne(
    { _id: new ObjectId(id) },
    { 
      $set: {
        ...memberData,
        updatedAt: new Date()
      }
    }
  );
  return result;
}

export async function deleteMember(id) {
  const collection = await getMembersCollection();
  const { ObjectId } = require('mongodb');
  const result = await collection.deleteOne({ _id: new ObjectId(id) });
  return result;
}