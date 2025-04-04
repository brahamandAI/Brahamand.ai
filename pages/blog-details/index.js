import React, { useEffect } from "react";
import { useRouter } from "next/router";

const BlogLayout = () => {
  const router = useRouter();
  const postId = router.query.blogId;

  useEffect(() => {
    if (postId === undefined) {
      router.push("/blog-details/1");
    }
  }, []);
};

export default BlogLayout;
