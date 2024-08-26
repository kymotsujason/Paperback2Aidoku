"use client";

import { useState, useEffect } from "react";
import styles from "./page.module.css";
import Navbar from "./navbar";
import Footer from "./footer";
import paperback2aidoku from "./paperback2aidoku";

const Home = () => {
	let [backup, setBackup] = useState({});
	let [log, setLogs] = useState("Waiting for file upload...");
	let [uploadDisabled, setUploadDisabled] = useState(false);
	let [downloadDisabled, setDownloadDisabled] = useState(true);
	let [date, setDate] = useState(new Date());

	// enable download button when data is processed (backup changes)
	useEffect(() => {
		setDownloadDisabled(false);
	}, [backup]);

	const onFileChange = async (event) => {
		setUploadDisabled(true);
		const file = event.target.files[0];
		const data = await paperback2aidoku(file, setLogs);
		let d = new Date(file.lastModified);
		setDate(d.toISOString().split("T")[0]);
		setBackup(data);
	};

	const downloadFile = () => {
		const blob = new Blob([JSON.stringify(backup)], {
			type: "application/json",
		});
		const href = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = href;
		link.download = "Aidoku-" + date + ".json";
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(href);
	};

	return (
		<main className={styles.main}>
			<Navbar />
			<div className={styles.flex}>
				<label
					htmlFor="file-upload"
					className={
						uploadDisabled ? styles.disabled_card : styles.card
					}
				>
					<h2>
						Upload <span>-&gt;</span>
					</h2>
				</label>
				<input
					id="file-upload"
					type="file"
					accept=".pas4"
					className={styles.input}
					onChange={(e) => onFileChange(e)}
					disabled={uploadDisabled}
				/>
				<div className={styles.logs}>{log}</div>
				<div
					className={
						downloadDisabled ? styles.disabled_card : styles.card
					}
					onClick={() => downloadFile()}
				>
					<h2>
						Download <span>-&gt;</span>
					</h2>
				</div>
			</div>
			<Footer />
		</main>
	);
};

export default Home;
