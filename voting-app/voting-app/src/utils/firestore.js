import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  increment,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '../firebase'

export const ADMIN_PASSWORD = '6963'

// ---------- Programmes ----------

export async function createProgramme(name, options = {}) {
  const ref_ = await addDoc(collection(db, 'programmes'), {
    name,
    password: ADMIN_PASSWORD,
    shuffleOnLoad: Boolean(options.shuffleOnLoad),
    createdAt: serverTimestamp(),
  })
  return ref_.id
}

export async function getProgrammes() {
  const q = query(collection(db, 'programmes'), orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export async function getProgramme(programmeId) {
  const snap = await getDoc(doc(db, 'programmes', programmeId))
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() }
}

export async function updateProgramme(programmeId, data) {
  await updateDoc(doc(db, 'programmes', programmeId), {
    ...data,
    password: ADMIN_PASSWORD,
    shuffleOnLoad: Boolean(data.shuffleOnLoad),
  })
}

export async function deleteProgramme(programmeId) {
  const choices = await getChoices(programmeId)
  for (const choice of choices) {
    await deleteDoc(doc(db, 'programmes', programmeId, 'choices', choice.id))
  }
  await deleteDoc(doc(db, 'programmes', programmeId))
}

// ---------- Choices ----------

export async function getChoices(programmeId) {
  const q = query(
    collection(db, 'programmes', programmeId, 'choices'),
    orderBy('order', 'asc'),
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export async function addChoice(programmeId, choice, order) {
  const ref_ = await addDoc(
    collection(db, 'programmes', programmeId, 'choices'),
    {
      name: choice.name,
      icon: choice.icon || '',
      imageUrl: choice.imageUrl || '',
      imagePath: choice.imagePath || '',
      description: choice.description || '',
      color: choice.color || '',
      votes: 0,
      order: order ?? Date.now(),
      createdAt: serverTimestamp(),
    },
  )
  return ref_.id
}

export async function updateChoice(programmeId, choiceId, data) {
  await updateDoc(
    doc(db, 'programmes', programmeId, 'choices', choiceId),
    data,
  )
}

export async function deleteChoice(programmeId, choiceId) {
  await deleteDoc(doc(db, 'programmes', programmeId, 'choices', choiceId))
}

export async function castVote(programmeId, choiceId) {
  await updateDoc(doc(db, 'programmes', programmeId, 'choices', choiceId), {
    votes: increment(1),
  })
}

export async function resetVotes(programmeId) {
  const choices = await getChoices(programmeId)
  await Promise.all(
    choices.map((c) =>
      updateDoc(doc(db, 'programmes', programmeId, 'choices', c.id), {
        votes: 0,
      }),
    ),
  )
}

// ---------- Image handling ----------

export async function uploadChoiceImage(_programmeId, file) {
  if (!file) return { url: '', path: '' }

  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve({ url: reader.result, path: '' })
    reader.onerror = () => reject(new Error('Unable to read the selected image.'))
    reader.readAsDataURL(file)
  })
}
