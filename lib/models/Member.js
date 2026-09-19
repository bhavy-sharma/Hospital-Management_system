import clientPromise from '../mongodb';
import { ObjectId } from 'mongodb'; // ✅ Import at top

export async function getMembersCollection() {
  const client = await clientPromise;
  const db = client.db('hospital_management');
  return db.collection('members');
}

export async function getAllMembers() {
  const collection = await getMembersCollection();
  return collection.find({}).sort({ name: 1 }).toArray();
}

export async function getMemberById(id) {
  const collection = await getMembersCollection();
  try {
    return collection.findOne({ _id: new ObjectId(id) });
  } catch (error) {
    console.error('Invalid ObjectId:', id);
    return null;
  }
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

// ✅ FIXED updateMember
export async function updateMember(id, memberData) {
  const collection = await getMembersCollection();
  try {
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: {
          ...memberData,
          updatedAt: new Date()
        }
      }
    );
    console.log('MongoDB update result:', result); // Debug
    return result;
  } catch (error) {
    console.error('MongoDB update error:', error);
    throw error;
  }
}

export async function deleteMember(id) {
  const collection = await getMembersCollection();
  try {
    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    return result;
  } catch (error) {
    console.error('MongoDB delete error:', error);
    throw error;
  }
}

export async function getMembersByRole(role) {
  const collection = await getMembersCollection();
  return collection.find({ role }).sort({ name: 1 }).toArray();
}

export async function searchMembers(query) {
  const collection = await getMembersCollection();
  return collection.find({
    $or: [
      { name: { $regex: query, $options: 'i' } },
      { specialization: { $regex: query, $options: 'i' } },
      { disease: { $regex: query, $options: 'i' } },
      { staffType: { $regex: query, $options: 'i' } },
      { details: { $regex: query, $options: 'i' } }
    ]
  }).sort({ name: 1 }).toArray();
}