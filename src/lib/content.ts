import type { CollectionEntry } from "astro:content";
import { categories } from "../data/categories";
import { withBase } from "./site";

export type NoteEntry = CollectionEntry<"notes">;

export function isPublished(note: NoteEntry) {
  return !note.data.draft;
}

export function sortNotes(notes: NoteEntry[]) {
  return [...notes].sort(
    (left, right) => right.data.date.getTime() - left.data.date.getTime()
  );
}

export function getPublishedNotes(notes: NoteEntry[]) {
  return sortNotes(notes.filter(isPublished));
}

export function formatDate(date: Date) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric"
  }).format(date);
}

export function getCategory(parentSlug: string, childSlug: string) {
  const parent = categories.find((entry) => entry.slug === parentSlug);
  const child = parent?.children.find((entry) => entry.slug === childSlug);

  return {
    parent,
    child
  };
}

export function getCategoryLabel(parentSlug: string, childSlug: string) {
  const { parent, child } = getCategory(parentSlug, childSlug);

  if (!parent || !child) {
    return "未分类";
  }

  return `${parent.label} / ${child.label}`;
}

export function getCategoryUrl(parentSlug: string, childSlug: string) {
  return withBase(`/categories/${parentSlug}/${childSlug}/`);
}

export function getNoteUrl(note: Pick<NoteEntry, "slug">) {
  return withBase(`/notes/${note.slug}/`);
}

export function getAssetUrl(path: string) {
  return withBase(path);
}

export function getCategoryGroupsWithCounts(notes: NoteEntry[]) {
  return categories.map((parent) => ({
    ...parent,
    toolCount: parent.children.filter((child) => child.kind === "tool").length,
    totalCount: notes.filter((note) => note.data.parentCategory === parent.slug)
      .length,
    children: parent.children.map((child) => ({
      ...child,
      count: notes.filter(
        (note) =>
          note.data.parentCategory === parent.slug &&
          note.data.childCategory === child.slug
      ).length
    }))
  }));
}
