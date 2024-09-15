import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
	title: "Paperback2Aidoku",
	description: "Convert Paperback .pas4 backups to Aidoku compatible json",
	keywords: [
		"paperback",
		"pas4",
		"backup",
		"conversion",
		"aidoku",
		"json",
		"restore",
		"ios",
		"paperback2aidoku",
		"paperback 2 aidoku",
		"paperback to aidoku",
	],
	robots: "index, follow",
	googlebot: "index, follow",
};

export default function RootLayout({ children }) {
	return (
		<html lang="en">
			<body className={inter.className}>
				{children}
				<Analytics />
				<SpeedInsights />
			</body>
		</html>
	);
}
