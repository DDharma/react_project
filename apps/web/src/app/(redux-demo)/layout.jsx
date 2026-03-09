import { ReduxProvider } from "@/store/provider"

export default function ReduxLayout({ children }) {
  return <ReduxProvider>{children}</ReduxProvider>
}
