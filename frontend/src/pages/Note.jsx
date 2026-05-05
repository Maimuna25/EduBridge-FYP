// Reusable note card component with delete action
export default function Note({ note, onDelete }) {
  return (
    <div className="note-card">

      {/* Note title */}
      <h4>{note.title}</h4>

      {/* Note content */}
      <p>{note.content}</p>

      {/* Action buttons */}
      <div className="note-actions">
        <button className="secondary-btn" onClick={() => onDelete(note.id)}>
          Delete
        </button>
      </div>
    </div>
  );
}
