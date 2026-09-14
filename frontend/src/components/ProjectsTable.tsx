import {
  Eye,
  GitFork,
  MonitorPlay,
} from "lucide-react";

import type {
  PublicProject,
} from "../api";

import {
  useAppTranslation,
} from "../shared/hooks/useAppTranslation";

interface ProjectsTableProps {
  projects: PublicProject[];
}

export default function ProjectsTable({
  projects,
}: ProjectsTableProps) {
  const {
    t,
  } = useAppTranslation();

  if (!projects.length) {
    return (
      <div
        className="
          flex
          min-h-[240px]

          items-center
          justify-center

          rounded-2xl

          border
          border-white/10

          bg-white/[0.03]

          p-6
        "
      >
        <p className="text-center text-sm text-zinc-500">
          {t(
            "projects.empty",
          )}
        </p>
      </div>
    );
  }

  const maxViews =
    Math.max(
      ...projects.map(
        (project) =>
          project.views,
      ),
      1,
    );

  return (
    <>
      {/* ================= MOBILE ================= */}

      <div className="grid gap-3 md:hidden">
        {projects.map(
          (
            project,
            index,
          ) => {
            const percentage =
              (project.views /
                maxViews) *
              100;

            return (
              <article
                key={
                  project.slug
                }
                className="
                  rounded-2xl

                  border
                  border-white/10

                  bg-white/[0.03]

                  p-4
                "
              >
                <div className="flex items-start gap-3">
                  <span
                    className="
                      flex
                      h-8
                      w-8
                      shrink-0

                      items-center
                      justify-center

                      rounded-lg

                      border
                      border-white/10

                      bg-white/5

                      text-xs
                      text-zinc-500
                    "
                  >
                    {index + 1}
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-zinc-200">
                      {
                        project.name
                      }
                    </p>

                    <p className="mt-0.5 truncate text-[11px] text-zinc-600">
                      {
                        project.slug
                      }
                    </p>
                  </div>
                </div>

                <div className="mt-5">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                      <Eye
                        size={
                          14
                        }
                      />

                      {t(
                        "projects.views",
                      )}
                    </div>

                    <span className="text-sm font-medium text-zinc-200">
                      {
                        project.views
                      }
                    </span>
                  </div>

                  <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                    <div
                      className="h-full rounded-full bg-[#37CBFB]"
                      style={{
                        width: `${percentage}%`,
                      }}
                    />
                  </div>
                </div>

                <div
                  className="
                    mt-4

                    grid
                    grid-cols-2
                    gap-2
                  "
                >
                  <div
                    className="
                      flex
                      items-center
                      justify-between

                      rounded-xl

                      border
                      border-white/[0.06]

                      bg-white/[0.02]

                      px-3
                      py-2.5
                    "
                  >
                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                      <GitFork
                        size={
                          14
                        }
                      />

                      {t(
                        "projects.github",
                      )}
                    </div>

                    <span className="text-sm text-zinc-200">
                      {
                        project.githubClicks
                      }
                    </span>
                  </div>

                  <div
                    className="
                      flex
                      items-center
                      justify-between

                      rounded-xl

                      border
                      border-white/[0.06]

                      bg-white/[0.02]

                      px-3
                      py-2.5
                    "
                  >
                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                      <MonitorPlay
                        size={
                          14
                        }
                      />

                      {t(
                        "projects.demo",
                      )}
                    </div>

                    <span className="text-sm text-zinc-200">
                      {
                        project.demoClicks
                      }
                    </span>
                  </div>
                </div>
              </article>
            );
          },
        )}
      </div>

      {/* ================= TABLET / DESKTOP ================= */}

      <div
        className="
          hidden
          overflow-hidden

          rounded-2xl

          border
          border-white/10

          bg-white/[0.03]

          md:block
        "
      >
        <div className="border-b border-white/10 p-5 lg:p-6">
          <h3 className="font-medium text-white">
            {t(
              "projects.title",
            )}
          </h3>

          <p className="mt-1 text-sm text-zinc-500">
            {t(
              "projects.description",
            )}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[650px]">
            <thead>
              <tr
                className="
                  border-b
                  border-white/10

                  text-left
                  text-xs
                  text-zinc-500
                "
              >
                <th className="px-5 py-4 font-medium lg:px-6">
                  {t(
                    "projects.project",
                  )}
                </th>

                <th className="px-5 py-4 font-medium lg:px-6">
                  {t(
                    "projects.views",
                  )}
                </th>

                <th className="px-5 py-4 text-center font-medium lg:px-6">
                  {t(
                    "projects.github",
                  )}
                </th>

                <th className="px-5 py-4 text-center font-medium lg:px-6">
                  {t(
                    "projects.demo",
                  )}
                </th>
              </tr>
            </thead>

            <tbody>
              {projects.map(
                (
                  project,
                  index,
                ) => {
                  const percentage =
                    (project.views /
                      maxViews) *
                    100;

                  return (
                    <tr
                      key={
                        project.slug
                      }
                      className="
                        border-b
                        border-white/[0.06]

                        transition

                        last:border-none

                        hover:bg-white/[0.02]
                      "
                    >
                      <td className="px-5 py-5 lg:px-6">
                        <div className="flex items-center gap-3 lg:gap-4">
                          <span
                            className="
                              flex
                              h-8
                              w-8
                              shrink-0

                              items-center
                              justify-center

                              rounded-lg

                              border
                              border-white/10

                              bg-white/5

                              text-xs
                              text-zinc-500
                            "
                          >
                            {index +
                              1}
                          </span>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-zinc-200">
                              {
                                project.name
                              }
                            </p>

                            <p className="mt-0.5 truncate text-xs text-zinc-600">
                              {
                                project.slug
                              }
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-5 lg:px-6">
                        <div className="flex min-w-[150px] items-center gap-3">
                          <Eye
                            size={
                              15
                            }
                            className="shrink-0 text-zinc-500"
                          />

                          <div className="w-full">
                            <span className="text-sm text-zinc-300">
                              {
                                project.views
                              }
                            </span>

                            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                              <div
                                className="h-full rounded-full bg-[#37CBFB]"
                                style={{
                                  width: `${percentage}%`,
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-5 text-center lg:px-6">
                        <div className="inline-flex items-center gap-2 text-sm text-zinc-300">
                          <GitFork
                            size={
                              15
                            }
                            className="text-zinc-500"
                          />

                          {
                            project.githubClicks
                          }
                        </div>
                      </td>

                      <td className="px-5 py-5 text-center lg:px-6">
                        <div className="inline-flex items-center gap-2 text-sm text-zinc-300">
                          <MonitorPlay
                            size={
                              15
                            }
                            className="text-zinc-500"
                          />

                          {
                            project.demoClicks
                          }
                        </div>
                      </td>
                    </tr>
                  );
                },
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}