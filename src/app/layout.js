import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
	title: "Paperback2Aidoku",
	description: "Convert Paperback .pas4 backups to Aidoku compatible json",
};

export default function RootLayout({ children }) {
	return (
		<html lang="en">
			<body className={inter.className}>{children}</body>
		</html>
	);
}
