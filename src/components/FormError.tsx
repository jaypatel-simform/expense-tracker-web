export function FormError({ messages }: { messages: string[] }) {
  if (messages.length === 0) return null;
  return (
    <div className="error" role="alert">
      {messages.length === 1 ? (
        messages[0]
      ) : (
        <ul>
          {messages.map((m) => (
            <li key={m}>{m}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
