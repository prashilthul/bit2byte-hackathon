import { redirect } from "next/navigation"

export default async function OldBattleRoomRedirect(props: { params: Promise<{ code: string }> }) {
  const { code } = await props.params
  redirect(`/games/battle/${code}`)
}
