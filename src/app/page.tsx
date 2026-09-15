type Post = {
  userId: number;
  id: number;
  title: string;
  body: string;
};

async function getPosts(): Promise<Post[]> {
  const res = await fetch("https://jsonplaceholder.typicode.com/posts?_limit=8", {
    // Ensures this runs on the server and is not cached forever during demo
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch posts");
  }

  return res.json();
}

export default async function Home() {
  const posts = await getPosts();

  return (
    <main className="mx-auto min-h-full w-full max-w-3xl px-6 py-16">
      <p className="mb-2 text-sm text-zinc-500">Server-side fetch demo</p>
      <h1 className="mb-2 text-3xl font-semibold tracking-tight text-zinc-900">
        Posts from JSONPlaceholder
      </h1>
      <p className="mb-10 text-zinc-600">
        Data is fetched in an async Server Component with{" "}
        <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-sm">fetch</code>
        — no client-side request.
      </p>

      <ul className="space-y-4">
        {posts.map((post) => (
          <li
            key={post.id}
            className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm"
          >
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-zinc-400">
              Post #{post.id}
            </p>
            <h2 className="mb-2 text-lg font-medium capitalize text-zinc-900">
              {post.title}
            </h2>
            <p className="text-sm leading-relaxed text-zinc-600">{post.body}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}
