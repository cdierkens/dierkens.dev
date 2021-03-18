import { formatDistance } from "date-fns";
import { Link } from "gatsby";
import React from "react";
import * as styles from "./BlogPreview.module.css";

interface BlogPreviewProps {
  author: string;
  avatar: string;
  date: string;
  description: string;
  title: string;
  href: string;
}

const BlogPreview: React.FC<BlogPreviewProps> = ({
  title,
  description,
  author,
  date,
  avatar,
  href,
}) => (
  <Link className={styles.BlogPreview} to={href}>
    <section className="shadow border border-gray-400 bg-white rounded flex flex-col justify-between p-4 transition-transform transform scale-100 rotate-0 hover:scale-105 hover:rotate-1">
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
          <p className="text-gray-600 my-1">
            {formatDistance(new Date(date), new Date(), {
              addSuffix: true,
            })}
          </p>
        </div>
      </div>
    </section>
  </Link>
);

export default BlogPreview;
