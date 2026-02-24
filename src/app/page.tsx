import { redirect } from "next/navigation";

export default function Home() {
  // Isso vai jogar o usuário direto para a tela de login
  redirect("/login");
}
