const JSZip = require("jszip");
const sources = require("./sources.json");

const backup = {
	library: [],
	history: [],
	manga: [],
	chapters: [],
	sources: [],
	categories: [],
	date: 0,
	name: "",
	version: "paperback2aidoku-v1",
};

const paperback2aidoku = async (file, setLogs) => {
	const filenames = {
		sourceManga: "",
		mangaInfo: "",
		library: "",
		chapter: "",
		history: [],
	};
	setLogs((logs) => [...logs, `\nReading ${file.name}...`]);
	backup.date = file.lastModified / 1000; // converting timestamp to seconds due to incompatibility
	const d = new Date(file.lastModified);
	backup.name = `Paperback Archive ${d.toISOString().split("T")[0]}`;
	const sourceCount = {}; // to compare with paperback migrate
	await JSZip.loadAsync(file).then(async (zip) => {
		// statically assign files to verify structure (although we still continue regardless)
		Object.keys(zip.files).forEach((filename) => {
			const sanitizedFilename = filename
				.toLowerCase()
				.replace(/[^0-9a-z]/gi, "");
			if (sanitizedFilename.includes("sourcemanga")) {
				filenames.sourceManga = filename;
			} else if (sanitizedFilename.includes("mangainfo")) {
				filenames.mangaInfo = filename;
			} else if (sanitizedFilename.includes("librarymanga")) {
				filenames.library = filename;
			} else if (sanitizedFilename.includes("chapterprogressmarker")) {
				filenames.history.push(filename);
			} else if (sanitizedFilename.includes("chapter")) {
				filenames.chapter = filename;
			}
		});
		if (
			filenames.sourceManga != "" &&
			filenames.mangaInfo != "" &&
			filenames.library != "" &&
			filenames.chapter != "" &&
			filenames.history.length > 0
		) {
			setLogs((logs) => [
				...logs,
				`\nDetected files: ${filenames.sourceManga}, ${filenames.mangaInfo}, ${filenames.library}, ${filenames.chapter}`,
			]);
			for (let filename of filenames.history) {
				setLogs((logs) => [...logs, `, ${filename}`]);
			}
		} else {
			setLogs((logs) => [
				...logs,
				`\nError, files do not match the expected format. Attempting to continue, but data may be incomplete.`,
			]);
		}
		setLogs((logs) => [...logs, `\nReading ${filenames.sourceManga}...`]);
		const sourceMangaJSON = JSON.parse(
			await zip.files[filenames.sourceManga].async("string")
		);
		setLogs((logs) => [
			...logs,
			` done\nReading ${filenames.mangaInfo}...`,
		]);
		const mangaInfoJSON = JSON.parse(
			await zip.files[filenames.mangaInfo].async("string")
		);
		setLogs((logs) => [...logs, ` done\nReading ${filenames.library}...`]);
		const libraryJSON = JSON.parse(
			await zip.files[filenames.library].async("string")
		);
		setLogs((logs) => [...logs, ` done\nReading ${filenames.chapter}...`]);
		const chapterJSON = JSON.parse(
			await zip.files[filenames.chapter].async("string")
		);
		setLogs((logs) => [...logs, ` done`]);
		const historyJSON = {};
		// history aka chapter progress markers, it's split into multiple files so we'll merge them into one object
		for (let filename of filenames.history) {
			setLogs((logs) => [...logs, `\nReading ${filename}...`]);
			const data = await zip.files[filename].async("string");
			Object.assign(historyJSON, JSON.parse(data)); // object assign allows const, spread requires let
			setLogs((logs) => [...logs, ` done`]);
		}
		setLogs((logs) => [...logs, `\nConverting library...`]);
		// process library, source manga, and manga info. Use library size, since we don't need the excess
		for (let libraryId in libraryJSON) {
			const library = libraryJSON[libraryId];
			const sourceMangaId = library.primarySource.id;
			const sourceManga = sourceMangaJSON[sourceMangaId];
			const mangaId = sourceManga.mangaId;
			const sourceId =
				sources[
					sourceManga.sourceId
						.toLowerCase()
						.replace(/[^0-9a-z]/gi, "")
				];
			const mangaInfoId = sourceManga.mangaInfo.id;
			const mangaInfo = mangaInfoJSON[mangaInfoId];
			if (backup.sources.indexOf(sourceId) === -1 && sourceId) {
				backup.sources.push(sourceId);
			}
			const statusText = mangaInfo.status
				.toLowerCase()
				.replace(/[^0-9a-z]/gi, "");
			const status = convertMangaStatus(statusText);
			const tags = [];
			for (let tagIndex in mangaInfo.tags[0].tags) {
				tags.push(mangaInfo.tags[0].tags[tagIndex].label);
			}
			sourceCount[sourceId] = (sourceCount[sourceId] || 0) + 1;
			const category = [];
			// category is called library tabs in paperback
			if (library.libraryTabs) {
				for (let i = 0; i < library.libraryTabs.length; i++) {
					if (library.libraryTabs[i].name) {
						if (
							backup.categories.indexOf(
								library.libraryTabs[i].name
							) === -1
						) {
							backup.categories.push(library.libraryTabs[i].name);
						}
						category.push(library.libraryTabs[i].name);
					}
				}
			}
			backup.manga.push({
				id: mangaId ?? "",
				sourceId: sourceId ?? "",
				title: mangaInfo.titles[0] ?? "", // should add multiple title handling in aidoku
				author: mangaInfo.author ?? "",
				artist: mangaInfo.artist ?? "",
				desc: mangaInfo.desc ?? "",
				tags: tags ?? [],
				cover: mangaInfo.image ?? "",
				url: "",
				status: Number(status ?? 0),
				nsfw: mangaInfo.hentai ? 1 : 0,
				viewer: Number(mangaInfo.additionalInfo.views ?? 0),
				lastUpdate: 0,
				//chapterFlags : 0, // looks like something for unread/downloaded filtering, skipping for now
				//langFilter : "", // probably used to filter by language, skipping for now
			});
			backup.library.push({
				lastOpened: Number(library.lastRead ?? 0), // if you've read it, you've opened it
				lastUpdated: Number(library.lastUpdated ?? 0),
				lastRead: Number(library.lastRead ?? 0),
				dateAdded: Number(library.dateBookmarked ?? 0),
				categories: category ?? [],
				mangaId: mangaId ?? "",
				sourceId: sourceId ?? "",
			});
		}
		setLogs((logs) => [
			...logs,
			` processed ${backup.library.length} entries` +
				`\nPopulating chapter info...`,
		]);
		// process chapter and history aka chapter progress markers. Should be the same size, but we use chapter because it has source manga id
		for (let chapterId in chapterJSON) {
			const chapter = chapterJSON[chapterId];
			const chapterProgressMarker = historyJSON[chapterId];
			const sourceMangaId = chapter.sourceManga.id;
			const sourceManga = sourceMangaJSON[sourceMangaId];
			const mangaId = sourceManga.mangaId;
			const sourceId =
				sources[
					sourceManga.sourceId
						.toLowerCase()
						.replace(/[^0-9a-z]/gi, "")
				];
			const sourceOrder = new Int16Array(1); // aidoku uses int16, javascript has int16array
			sourceOrder[0] = Math.abs(chapter.sortingIndex);
			backup.chapters.push({
				sourceId: sourceId ?? "",
				mangaId: mangaId ?? "",
				id: sourceMangaId ?? "",
				title:
					chapter.name == ""
						? "Chapter " + chapter.chapNum.toString()
						: chapter.name,
				scanlator: chapter.group ?? "",
				lang: chapter.langCode ?? "",
				chapter: Number(chapter.chapNum ?? 0),
				volume: Number(chapter.volume ?? 0),
				dateUploaded: Number(chapter.time + 978307200 ?? 978307200), // 978307200 conversion from apple to epoch
				sourceOrder: sourceOrder[0],
			});
			backup.history.push({
				dateRead: Number(
					chapterProgressMarker.time + 978307200 ?? 978307200
				), // 978307200 conversion from apple to epoch
				sourceId: sourceId ?? "",
				chapterId: chapterProgressMarker.chapter.id.split("+")[1] ?? "",
				mangaId: mangaId ?? "",
				progress: Number(chapterProgressMarker.lastPage ?? 0),
				total: Number(chapterProgressMarker.totalPages ?? 0),
				completed: chapterProgressMarker.completed ?? false,
			});
		}
	});
	setLogs((logs) => [
		...logs,
		` processed ${backup.chapters.length} chapter entries` +
			`\nTotal manga per source (compare with the migrate tab in Paperback):`,
	]);
	for (let source in sourceCount) {
		if (source.includes("toonily")) {
			setLogs((logs) => [
				...logs,
				`\n${source}: ${sourceCount[source]} (migrate after restoring in aidoku or use this tool https://github.com/kymotsujason/ToonilyID2Title)`,
			]);
		} else if (source.includes("nepnep")) {
			setLogs((logs) => [
				...logs,
				`\n${source}: ${sourceCount[source]} (this combines mangasee and mangalife)`,
			]);
		} else if (source.includes("manganato")) {
			setLogs((logs) => [
				...logs,
				`\n${source}: ${sourceCount[source]} (this includes mangakakalot)`,
			]);
		} else {
			setLogs((logs) => [...logs, `\n${source}: ${sourceCount[source]}`]);
		}
	}
	setLogs((logs) => [
		...logs,
		`\nTotal manga in your library: ${backup.library.length}`,
	]);
	return backup;
};

const convertMangaStatus = (status) => {
	switch (status) {
		case "ongoing":
			return 1;
		case "completed":
			return 2;
		case "cancelled":
			return 3;
		case "hiatus":
			return 4;
		case "notpublished":
			return 5;
		default:
			return 0;
	}
};

export default paperback2aidoku;
