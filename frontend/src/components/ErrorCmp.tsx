export default function ErrorCmp({ message }: { message: string }) {
  return (
    <div className="text-red-400 m-4 font-bold">
      <p>{message}</p>
    </div>
  );
}
