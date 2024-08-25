import "./footer.css";
import { FaRegCopyright } from "react-icons/fa";
import { FaGithub } from "react-icons/fa";

const Footer = () => {
	return (
		<div className="footer">
			<FaRegCopyright /> 2024 Jason Yue{" - "}
			<span>
				<a
					style={{ color: "white" }}
					href="https://github.com/kymotsujason/Paperback2Aidoku"
					target="_blank"
					rel="noopener noreferrer"
				>
					<FaGithub />
				</a>
			</span>
		</div>
	);
};

export default Footer;
