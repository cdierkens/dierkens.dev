import React from "react";
import styles from "./BlogPreview.module.scss";

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
  avatar
}) => (
  <div className={styles.BlogPreview}>
    <div className="mb-8">
      <div className={styles.Title}>{title}</div>
      <p className={styles.Description}>{description}</p>
    </div>
    <div className="flex items-center">
      <img
        className="w-10 h-10 rounded-full mr-4"
        src={avatar}
        alt={`Avatar of ${author}`}
      />
      <div className="text-sm">
        <p className="text-gray-900">{author}</p>
        <p className="text-gray-600">{date}</p>
      </div>
    </div>
  </div>
);

export default BlogPreview;
