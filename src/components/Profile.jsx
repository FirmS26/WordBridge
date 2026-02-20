import React, { useState, useEffect } from "react";
import "./Profile.css";

export default function Profile() {
  const placeholder = "https://via.placeholder.com/150";

  const [dark, setDark] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    level: "Beginner",
    words: 0,
    avatar: ""
  });

  useEffect(() => {
    const saved = localStorage.getItem("wb-profile");
    if (saved) setForm(JSON.parse(saved));

    const theme = localStorage.getItem("wb-theme");
    if (theme === "dark") {
      setDark(true);
      document.body.classList.add("dark");
    }
  }, []);

  const progress = Math.min(100, form.words / 10);

  const save = () => {
    localStorage.setItem("wb-profile", JSON.stringify(form));
    alert("Profile Saved");
  };

  const reset = () => {
    setForm({
      name: "",
      email: "",
      level: "Beginner",
      words: 0,
      avatar: ""
    });
  };

  const toggleTheme = () => {
    setDark(!dark);
    document.body.classList.toggle("dark");
    localStorage.setItem("wb-theme", !dark ? "dark" : "light");
  };

  const onPickAvatar = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setForm({ ...form, avatar: reader.result });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="profile-wrap">
      <header className="toolbar">
        <h1>My Profile</h1>
        <span className="muted">Manage your learning info</span>
        <div className="spacer"></div>
        <button className="btn" onClick={toggleTheme}>
          {dark ? "Light Mode" : "Dark Mode"}
        </button>
      </header>

      <div className="grid">

        <div className="card avatar-card">
          <img
            src={form.avatar || placeholder}
            alt="avatar"
            className="avatar"
          />
          <label className="btn upload-btn">
            Upload Avatar
            <input type="file" onChange={onPickAvatar} hidden />
          </label>
        </div>

        <div className="card">

          <div className="row">
            <label>Name</label>
            <input
              className="input"
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
            />
          </div>

          <div className="row">
            <label>Email</label>
            <input
              className="input"
              value={form.email}
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
            />
          </div>

          <div className="row">
            <label>English Level</label>
            <select
              className="input"
              value={form.level}
              onChange={(e) =>
                setForm({ ...form, level: e.target.value })
              }
            >
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Advanced</option>
            </select>
          </div>

          <div className="row">
            <label>Words Learned</label>
            <input
              type="number"
              className="input"
              value={form.words}
              onChange={(e) =>
                setForm({ ...form, words: Number(e.target.value) })
              }
            />
          </div>

          <div className="row">
            <label>Progress</label>
            <div className="progress">
              <div
                className="progress-bar"
                style={{ width: progress + "%" }}
              ></div>
            </div>
            <div className="muted">{progress}% Completed</div>
          </div>

          <div className="actions">
            <button className="btn danger" onClick={reset}>
              Reset
            </button>
            <button className="btn primary" onClick={save}>
              Save
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}