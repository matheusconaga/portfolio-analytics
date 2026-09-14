import {
  ArrowUpRight,
  Code2,
  ExternalLink,
  Globe2,
  Heart,
  Mail,
} from "lucide-react";

import { FaGithub, FaLinkedin, FaWhatsapp } from "react-icons/fa";

interface ProjectFooterProps {
  projectName: string;
  locale?: "pt" | "en";
}

export default function ProjectFooter({
  projectName,
  locale = "pt",
}: ProjectFooterProps) {
  const currentYear = new Date().getFullYear();

  const content = {
    pt: {
      role: "Desenvolvedor Full Stack",

      description:
        "Desenvolvo aplicações web, mobile, APIs e produtos digitais com foco em performance, experiência do usuário e arquitetura escalável.",

      portfolio: "Conheça meu portfólio",

      portfolioDescription:
        "Veja outros projetos, produtos e experiências que desenvolvi.",

      links: "Links",

      portfolioLink: "Portfólio",

      github: "GitHub",

      linkedin: "LinkedIn",

      contact: "Contato",

      project: "Projeto",

      developedBy: "Desenvolvido por",

      builtWith: "Criado com",

      rights: "Todos os direitos reservados.",
    },

    en: {
      role: "Full Stack Developer",

      description:
        "I build web and mobile applications, APIs and digital products focused on performance, user experience and scalable architecture.",

      portfolio: "Explore my portfolio",

      portfolioDescription:
        "Discover other projects, products and experiences I've built.",

      links: "Links",

      portfolioLink: "Portfolio",

      github: "GitHub",

      linkedin: "LinkedIn",

      contact: "Contact",

      project: "Project",

      developedBy: "Developed by",

      builtWith: "Built with",

      rights: "All rights reserved.",
    },
  };

  const t = content[locale];

  return (
    <footer
      className="
        relative
        mt-16
        w-full
        overflow-hidden

        border-t
        border-white/10

        bg-[#080322]
        text-white
      "
    >
      {/* CONTENT */}
      <div
        className="
          mx-auto
          flex
          w-full
          max-w-7xl
          flex-col

          px-4
          py-10

          sm:px-6
          sm:py-12

          lg:px-8
          lg:py-14
        "
      >
        {/* TOP */}
        <div
          className="
            grid
            grid-cols-1
            gap-10

            md:grid-cols-2

            lg:grid-cols-[1.4fr_0.8fr_1fr]
            lg:gap-14
          "
        >
          {/* DEVELOPER */}
          <div
            className="
              flex
              max-w-xl
              flex-col
              items-start
            "
          >
            {/* BRAND */}
            <div
              className="
                flex
                items-center
                gap-3
              "
            >
              <img
                src="/logo_matheus.webp"
                alt="Matheus Lula"
                className="
                  w-16 
                  md:w-20
                  shrink-0
                  object-contain

                  sm:w-16
                "
              />

              <div className="flex flex-col">
                <span className="text-2xl md:text-3xl font-bold text-primary">
                  Matheus Lula
                </span>
                <span className="text-white/70 text-sm md:text-lg font-medium">
                  Fullstack Developer Web & Mobile
                </span>
              </div>
            </div>

            {/* DESCRIPTION */}
            <p
              className="
                mt-5
                max-w-lg

                text-sm
                leading-6
                text-white/55

                sm:text-base
                sm:leading-7
              "
            >
              {t.description}
            </p>

            {/* SOCIAL */}
            <div
              className="
                mt-6
                flex
                flex-wrap
                items-center
                gap-2
              "
            >
              <a
                href="https://github.com/matheusconaga"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center

                  rounded-full

                  border
                  border-white/10

                  bg-white/[0.04]

                  text-white/60

                  transition-colors
                  duration-200

                  hover:border-[#77D2FA]/30
                  hover:bg-[#77D2FA]/10
                  hover:text-[#77D2FA]
                "
              >
                <FaGithub size={18} />
              </a>

              <a
                href="https://www.linkedin.com/in/matheusconaga"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center

                  rounded-full

                  border
                  border-white/10

                  bg-white/[0.04]

                  text-white/60

                  transition-colors
                  duration-200

                  hover:border-[#77D2FA]/30
                  hover:bg-[#77D2FA]/10
                  hover:text-[#77D2FA]
                "
              >
                <FaLinkedin size={18} />
              </a>

              <a
                href="https://wa.me/5586981451876"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center

                  rounded-full

                  border
                  border-white/10

                  bg-white/[0.04]

                  text-white/60

                  transition-colors
                  duration-200

                  hover:border-[#77D2FA]/30
                  hover:bg-[#77D2FA]/10
                  hover:text-[#77D2FA]
                "
              >
                <FaWhatsapp size={18} />
              </a>

              <a
                href="mailto:matheusphillip170@gmail.com"
                aria-label="Email"
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center

                  rounded-full

                  border
                  border-white/10

                  bg-white/[0.04]

                  text-white/60

                  transition-colors
                  duration-200

                  hover:border-[#77D2FA]/30
                  hover:bg-[#77D2FA]/10
                  hover:text-[#77D2FA]
                "
              >
                <Mail size={17} />
              </a>
            </div>
          </div>

          {/* LINKS */}
          <div
            className="
              flex
              flex-col
              gap-5
            "
          >
            <p
              className="
                text-xs
                font-bold
                uppercase
                tracking-[0.18em]
                text-white/40
              "
            >
              {t.links}
            </p>

            <nav
              className="
                flex
                flex-col
                gap-3
              "
            >
              <a
                href="https://matheusconaga.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="
                  group

                  flex
                  w-fit
                  items-center
                  gap-2

                  text-sm
                  text-white/60

                  transition-colors

                  hover:text-[#77D2FA]
                "
              >
                <Globe2 size={15} />

                {t.portfolioLink}

                <ArrowUpRight
                  size={13}
                  className="
                    opacity-50
                    transition-transform

                    group-hover:translate-x-0.5
                    group-hover:-translate-y-0.5
                  "
                />
              </a>

              <a
                href="https://github.com/matheusconaga"
                target="_blank"
                rel="noopener noreferrer"
                className="
                  group

                  flex
                  w-fit
                  items-center
                  gap-2

                  text-sm
                  text-white/60

                  transition-colors

                  hover:text-[#77D2FA]
                "
              >
                <FaGithub size={15} />

                {t.github}

                <ArrowUpRight
                  size={13}
                  className="
                    opacity-50
                    transition-transform

                    group-hover:translate-x-0.5
                    group-hover:-translate-y-0.5
                  "
                />
              </a>

              <a
                href="https://www.linkedin.com/in/matheusconaga"
                target="_blank"
                rel="noopener noreferrer"
                className="
                  group

                  flex
                  w-fit
                  items-center
                  gap-2

                  text-sm
                  text-white/60

                  transition-colors

                  hover:text-[#77D2FA]
                "
              >
                <FaLinkedin size={15} />

                {t.linkedin}

                <ArrowUpRight
                  size={13}
                  className="
                    opacity-50
                    transition-transform

                    group-hover:translate-x-0.5
                    group-hover:-translate-y-0.5
                  "
                />
              </a>

              <a
                href="mailto:matheusphillip170@gmail.com"
                className="
                  group

                  flex
                  w-fit
                  items-center
                  gap-2

                  text-sm
                  text-white/60

                  transition-colors

                  hover:text-[#77D2FA]
                "
              >
                <Mail size={15} />

                {t.contact}

                <ArrowUpRight
                  size={13}
                  className="
                    opacity-50
                    transition-transform

                    group-hover:translate-x-0.5
                    group-hover:-translate-y-0.5
                  "
                />
              </a>
            </nav>
          </div>

          {/* PORTFOLIO CTA */}
          <div>
            <div
              className="
                rounded-2xl

                border
                border-white/10

                bg-white/[0.035]

                p-5
              "
            >
              <div
                className="
                  flex
                  items-center
                  justify-between
                  gap-3
                "
              >
                <div>
                  <p
                    className="
                      text-[10px]
                      font-bold
                      uppercase
                      tracking-[0.18em]
                      text-white/35
                    "
                  >
                    {t.project}
                  </p>

                  <p
                    className="
                      mt-1
                      font-semibold
                      text-white
                    "
                  >
                    {projectName}
                  </p>
                </div>

                <div
                  className="
                    flex
                    h-9
                    w-9
                    shrink-0
                    items-center
                    justify-center

                    rounded-lg

                    bg-[#77D2FA]/10
                    text-[#77D2FA]
                  "
                >
                  <Code2 size={17} />
                </div>
              </div>

              <div
                className="
                  my-5
                  h-px
                  w-full
                  bg-white/[0.08]
                "
              />

              <p
                className="
                  text-sm
                  font-semibold
                  text-white
                "
              >
                {t.portfolio}
              </p>

              <p
                className="
                  mt-2

                  text-xs
                  leading-5
                  text-white/45
                "
              >
                {t.portfolioDescription}
              </p>

              <a
                href="https://matheusconaga.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="
    group

    mt-5

    inline-flex
    min-h-10
    w-full

    items-center
    justify-center
    gap-2

    rounded-full

    bg-[#77D2FA]

    px-4
    py-2.5

    text-sm
    font-semibold
    text-[#080322]

    cursor-pointer

    transform
    transition-all
    duration-200

    hover:-translate-y-1
    hover:bg-[#37CBFB]
    hover:shadow-lg
    hover:shadow-[#77D2FA]/10

    active:-translate-y-1
    active:bg-[#37CBFB]
    active:shadow-lg
    active:shadow-[#77D2FA]/10
  "
              >
                {t.portfolioLink}

                <ExternalLink
                  size={14}
                  className="
      transition-transform
      duration-200

      group-hover:translate-x-0.5
      group-hover:-translate-y-0.5

      group-active:translate-x-0.5
      group-active:-translate-y-0.5
    "
                />
              </a>
            </div>
          </div>
        </div>

        {/* BOTTOM */}
        <div
          className="
            mt-10

            flex
            flex-col
            gap-4

            border-t
            border-white/10

            pt-6

            text-center

            sm:flex-row
            sm:items-center
            sm:justify-between
            sm:text-left
          "
        >
          <p
            className="
              text-xs
              text-white/35
            "
          >
            © {currentYear} Matheus Lula. {t.rights}
          </p>

          <div
            className="
              flex
              flex-wrap
              items-center
              justify-center
              gap-1.5

              text-xs
              text-white/35

              sm:justify-end
            "
          >
            {t.developedBy}

            <a
              href="https://matheusconaga.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="
                font-medium
                text-white/60

                transition-colors

                hover:text-[#77D2FA]
              "
            >
              Matheus Lula
            </a>

            <span>·</span>

            {t.builtWith}

            <Heart
              size={12}
              className="
                fill-[#77D2FA]
                text-[#77D2FA]
              "
            />
          </div>
        </div>
      </div>
    </footer>
  );
}
