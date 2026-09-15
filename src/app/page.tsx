type CmsInfoItem = {
  id?: number;
  title?: string;
  description?: string;
  secondTitle?: string;
  secondDescription?: string;
};

type CmsMave = {
  title?: string;
  altTitle?: string;
  description?: string;
  infoItems?: CmsInfoItem[];
};

type CmsComponent = {
  type?: string;
  _mave?: CmsMave;
};

type CareersPage = {
  id: number;
  page_name_en?: string;
  body?: {
    data?: {
      section_1?: { data?: CmsComponent[] };
      section_2?: { data?: CmsComponent[] };
    };
  };
};

type Job = {
  id: string;
  title: string;
  division: string;
  meta: string;
  description: string;
};

export const dynamic = "force-dynamic";

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function getCareersPage(): Promise<CareersPage> {
  const res = await fetch(
    "https://ethermave.etherstaging.xyz/ss_group/api/pages/17",
    {
      cache: "no-store",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    },
  );

  if (!res.ok) {
    throw new Error(`SS Group API error: ${res.status}`);
  }

  return res.json();
}

function mapJobs(page: CareersPage): Job[] {
  const sectionData = page.body?.data?.section_2?.data ?? [];

  return sectionData
    .filter((component) => component.type === "infobox" && component._mave?.title)
    .flatMap((component, divisionIndex) => {
      const box = component._mave!;
      const division = box.title || "Division";

      return (box.infoItems ?? []).map((item, jobIndex) => {
        const metaParts = (item.secondTitle || "")
          .split("|")
          .map((part) => part.trim())
          .filter(Boolean);
        const salary = stripHtml(item.secondDescription || "") || "Competitive Salary";
        const meta = [...metaParts, salary].filter(Boolean).join(" · ");

        return {
          id: String(item.id ?? `${divisionIndex}-${jobIndex}`),
          title: item.title || `Role ${jobIndex + 1}`,
          division,
          meta,
          description:
            stripHtml(item.description || "") ||
            "Join our team and grow your career with SS Group.",
        };
      });
    });
}

export default async function Home() {
  const page = await getCareersPage();
  const jobs = mapJobs(page);
  const hero = page.body?.data?.section_1?.data?.find(
    (c) => c.type === "titledescription",
  )?._mave;

  return (
    <main className="mx-auto min-h-full w-full max-w-3xl px-6 py-16">
      <p className="mb-2 text-sm text-zinc-500">
        SS Group API · server-side · dynamic
      </p>
      <h1 className="mb-2 text-3xl font-semibold tracking-tight text-zinc-900">
        {hero?.title || page.page_name_en || "SS Group Careers"}
      </h1>
      <p className="mb-10 text-zinc-600">
        {hero?.altTitle ||
          "Live openings from Mave CMS — fetched on each request with cache: no-store."}
      </p>

      {jobs.length === 0 ? (
        <p className="text-zinc-500">No openings returned from the API.</p>
      ) : (
        <ul className="space-y-4">
          {jobs.map((job) => (
            <li
              key={job.id}
              className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm"
            >
              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-zinc-400">
                {job.division}
              </p>
              <h2 className="mb-1 text-lg font-medium text-zinc-900">
                {job.title}
              </h2>
              {job.meta ? (
                <p className="mb-2 text-xs text-zinc-500">{job.meta}</p>
              ) : null}
              <p className="text-sm leading-relaxed text-zinc-600">
                {job.description}
              </p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
