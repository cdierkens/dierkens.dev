import React from "react";
import styles from "./BlogPreview.module.css";

interface BlogPreviewProps {
  author: string;
  avatar: string;
  date: string;
  description: string;
  title: string;
}

const BlogPreview: React.FC<BlogPreviewProps> = ({
  title,
  description,
  author,
  date,
  avatar,
}) => (
  <section className={styles.BlogPreview}>
    <h2 className={styles.Title}>{title}</h2>
    <p className={styles.Description}>{description}</p>
    <div className="flex items-center">
      <img
        className="w-10 h-10 rounded-full mr-4"
        src={avatar}
        alt={`Avatar of ${author}`}
      />
      <div className="text-sm">
        <p className="text-gray-900 my-1">{author}</p>
        <p className="text-gray-600 my-1">{date}</p>
      </div>
    </div>
  </section>
);

export default BlogPreview;
