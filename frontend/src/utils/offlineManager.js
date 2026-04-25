import { openDB } from "idb";

const dbPromise = openDB("eduBridgeDB", 2, {
  upgrade(db) {

    if (!db.objectStoreNames.contains("quizzes")) {
      db.createObjectStore("quizzes", { keyPath: "id" });
    }

    if (!db.objectStoreNames.contains("topics")) {
      db.createObjectStore("topics", { keyPath: "slug" });
    }

    if (!db.objectStoreNames.contains("attempts")) {
      db.createObjectStore("attempts", { keyPath: "id", autoIncrement: true });
    }

  },
});


// ============================
// HELPER: GET CURRENT USER ID
// ============================

function getUserId(userId) {
  if (userId) return userId;

  const stored = localStorage.getItem("current_user");

  if (!stored) return null;

  try {
    return JSON.parse(stored).id;
  } catch {
    return Number(stored);
  }
}


// ============================
// QUIZ STORAGE
// ============================

export async function cacheQuizzes(quizzes, userId) {

  const db = await dbPromise;
  const tx = db.transaction("quizzes", "readwrite");

  quizzes.forEach(q => {
    tx.store.put({
      ...q,
      userId
    });
  });

  await tx.done;
}

export async function getCachedQuizzes(userId) {

  const uid = getUserId(userId);
  if (!uid) return [];

  const db = await dbPromise;
  const quizzes = await db.getAll("quizzes");

  return quizzes.filter(q => q.userId === uid);
}

export async function getCachedQuiz(id, userId) {

  const uid = getUserId(userId);
  if (!uid) return null;

  const db = await dbPromise;

  const quiz = await db.get("quizzes", id);

  console.log("📦 Cached quiz from DB:", quiz);

  if (quiz && quiz.userId === uid) {
    return quiz;
  }

  return null;
}

export async function deleteCachedQuiz(id, userId) {

  const uid = getUserId(userId);
  if (!uid) return;

  const db = await dbPromise;
  const quiz = await db.get("quizzes", id);

  if (quiz && quiz.userId === uid) {

    const tx = db.transaction("quizzes", "readwrite");
    await tx.store.delete(id);
    await tx.done;

  }
}


// ============================
// TOPIC STORAGE
// ============================

export async function cacheTopics(topics, userId) {

  const db = await dbPromise;
  const tx = db.transaction("topics", "readwrite");

  topics.forEach(t => {
    tx.store.put({
      ...t,
      userId
    });
  });

  await tx.done;
}

export async function getCachedTopics(userId) {

  const uid = getUserId(userId);
  if (!uid) return [];

  const db = await dbPromise;
  const topics = await db.getAll("topics");

  return topics.filter(t => t.userId === uid);
}

export async function getCachedTopic(slug, userId) {

  const uid = getUserId(userId);
  if (!uid) return null;

  const db = await dbPromise;

  const topic = await db.get("topics", slug);

  if (topic && topic.userId === uid) {
    return topic;
  }

  return null;
}


// ============================
// OFFLINE ATTEMPTS
// ============================

export async function saveOfflineAttempt(attempt, userId) {

  const uid = getUserId(userId);
  if (!uid) return;

  const db = await dbPromise;
  const tx = db.transaction("attempts", "readwrite");

  await tx.store.add({
    ...attempt,
    userId: uid
  });

  await tx.done;
}


// ============================
// SYNC ATTEMPTS
// ============================

export async function syncAttempts(userId) {

  const uid = getUserId(userId);
  if (!uid) return;

  const db = await dbPromise;

  const attempts = await db.getAll("attempts");

  const userAttempts = attempts.filter(a => a.userId === uid);

  for (const attempt of userAttempts) {

    await fetch("http://127.0.0.1:8000/api/submit-quiz/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(attempt),
    });

  }

  const tx = db.transaction("attempts", "readwrite");

  for (const attempt of userAttempts) {
    await tx.store.delete(attempt.id);
  }

  await tx.done;
}