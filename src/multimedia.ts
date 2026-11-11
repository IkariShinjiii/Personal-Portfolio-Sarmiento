import data from "@/data/multimedia.json";

/**
 * One piece of media on a work. Files are added here once they exist:
 * - video: an MP4 (on Vercel Blob) with an optional poster image
 * - frames: storyboard panels, each a small image
 * - image: a single poster, e.g. an infographic
 * - pdf: a document to open in a new tab
 */
export type Media =
  | { kind: "video"; src: string; poster?: string }
  | { kind: "frames"; frames: { src: string; alt: string }[] }
  | { kind: "image"; src: string; alt: string }
  | { kind: "pdf"; src: string; label?: string };

export type WorkType = "Infographic" | "Storyboard" | "Video" | "Animation" | "Project" | "Activity";

export type Work = {
  slug: string;
  title: string;
  type: WorkType;
  module: string;
  date: string;
  summary: string;
  details: string[];
  tools: string[];
  media: Media[];
};

export type Course = (typeof data)["course"];

export const course: Course = data.course;
export const works = data.works as Work[];

export const findWork = (slug: string | undefined) => works.find((w) => w.slug === slug);

/** True once a work has at least one real file attached. */
export const hasMedia = (w: Work) => w.media.length > 0;
