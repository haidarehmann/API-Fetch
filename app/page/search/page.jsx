'use client';
import { useState } from "react";
import "./search.css";
import { IoMdSearch } from "react-icons/io";
import { TbMoonFilled } from "react-icons/tb";
import { GoSun } from "react-icons/go";

const PER_PAGE = 10;

export default function Search() {
  const [username, setUsername] = useState("");
  const [profile, setProfile] = useState(null);
  const [repos, setRepos] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [dark, setDark] = useState(false);
  const [error, setError] = useState("");

  const fetchRepos = async (user, pageNum, replace = false) => {
    const res = await fetch(
      `https://api.github.com/users/${user}/repos?per_page=${PER_PAGE}&page=${pageNum}&sort=updated`
    );
    const data = await res.json();
    setRepos(prev => replace ? data : [...prev, ...data]);
    setHasMore(data.length === PER_PAGE);
  };

  const searchUser = async () => {
    if (!username.trim()) return;
    setError("");
    setProfile(null);
    setRepos([]);
    setPage(1);

    const res = await fetch(`https://api.github.com/users/${username.trim()}`);
    const data = await res.json();

    if (data.message === "Not Found") {
      setError("User not found.");
      return;
    }

    setProfile(data);
    fetchRepos(username.trim(), 1, true);
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchRepos(username.trim(), nextPage);
  };

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.setAttribute("data-theme", next ? "dark" : "light");
  };

  return (
    <div className="container">
      <h1 className="repo">GitHub User Finder</h1>

      <div className="search-row">
        <input
          className="user"
          value={username}
          onChange={e => setUsername(e.target.value)}
          onKeyDown={e => e.key === "Enter" && searchUser()}
          placeholder="Enter GitHub username…"
        />
        <button className="search-btn" onClick={searchUser}>
          <IoMdSearch size={16} /> Search
        </button>
        <button id="toggleMode" onClick={toggleTheme} title="Toggle theme">
          {dark ? <TbMoonFilled /> : <GoSun />}
        </button>
      </div>

      {error && <p className="status-msg">{error}</p>}

      {profile && (
        <div id="profile">
          <div className="profile-top">
            <img src={profile.avatar_url} alt={profile.login} />
            <div className="profile-info">
              <h2>{profile.name || profile.login}</h2>
              <a
                className="handle"
                href={profile.html_url}
                target="_blank"
                rel="noreferrer"
              >
                @{profile.login}
              </a>
              {profile.bio && <p className="bio">{profile.bio}</p>}
              {profile.location && (
                <p className="location">📍 {profile.location}</p>
              )}
            </div>
          </div>
          <div className="profile-stats">
            <div><span>{profile.public_repos}</span> repos</div>
            <div><span>{profile.followers}</span> followers</div>
            <div><span>{profile.following}</span> following</div>
          </div>
        </div>
      )}

      {repos.length > 0 && (
        <div id="repos">
          <div className="repos-title">Repositories</div>
          {repos.map((repo, i) => (
            <div className="repo-item" key={`${repo.id}-${i}`}>
              <a href={repo.html_url} target="_blank" rel="noreferrer">
                {repo.name}
              </a>
              <div className="repo-meta">
                {repo.language && <span>{repo.language}</span>}
                <span>⭐ {repo.stargazers_count}</span>
              </div>
            </div>
          ))}
          {hasMore && (
            <button id="load-more-btn" style={{ display: "block" }} onClick={loadMore}>
              Load more
            </button>
          )}
        </div>
      )}
    </div>
  );
}