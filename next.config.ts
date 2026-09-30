import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // The builder used to live at /places, which is already linked from
      // the published README.
      { source: "/places", destination: "/builder", permanent: true },
    ];
  },
};

export default nextConfig;
