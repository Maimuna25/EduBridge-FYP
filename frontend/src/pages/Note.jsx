export default function Note({ note, onDelete }) {
  return (
    <div className="note-card">
      <h4>{note.title}</h4>
      <p>{note.content}</p>

      <div className="note-actions">
        <button className="secondary-btn" onClick={() => onDelete(note.id)}>
          Delete
        </button>
      </div>
    </div>
  );
}
