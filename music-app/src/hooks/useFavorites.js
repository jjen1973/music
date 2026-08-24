import { useEffect, useState } from "react";
import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../firebase";

export function useFavorites(userKey) {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  const favRef = userKey
    ? collection(db, "users", userKey, "favorites")
    : null;

  useEffect(() => {
    if (!userKey) {
      setFavorites([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    getDocs(favRef).then((snap) => {
      setFavorites(snap.docs.map((d) => d.id));
      setLoading(false);
    });
  }, [userKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggle = async (trackId) => {
    if (!userKey) return;
    const docRef = doc(db, "users", userKey, "favorites", trackId);
    if (favorites.includes(trackId)) {
      await deleteDoc(docRef);
      setFavorites((prev) => prev.filter((id) => id !== trackId));
    } else {
      await setDoc(docRef, { addedAt: new Date() });
      setFavorites((prev) => [...prev, trackId]);
    }
  };

  return { favorites, loading, toggle };
}
