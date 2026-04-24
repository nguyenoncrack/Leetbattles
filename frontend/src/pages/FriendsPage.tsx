import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ApiError } from "../api/client";
import { FriendsAPI, UsersAPI } from "../api/endpoints";
import { Avatar } from "../components/Avatar";
import { EmptyState } from "../components/EmptyState";
import { IconFlame, IconUsers } from "../components/icons";
import { Spinner } from "../components/Spinner";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { fmt } from "../lib/format";
import type { FriendshipsDTO, UserDTO } from "../types/api";

export function FriendsPage() {
  const { user: me, refresh, setUser } = useAuth();
  const { toast } = useToast();
  const [data, setData] = useState<FriendshipsDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserDTO[]>([]);
  const [searching, setSearching] = useState(false);
  const debRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await FriendsAPI.list();
      setData(res);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (debRef.current) clearTimeout(debRef.current);
    if (query.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    debRef.current = setTimeout(async () => {
      try {
        const { users } = await UsersAPI.search(query.trim());
        setSearchResults(users.filter((u) => u.id !== me?.id));
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 250);
  }, [query, me?.id]);

  const request = async (u: UserDTO) => {
    try {
      const res = await FriendsAPI.request({ userId: u.id });
      toast({
        tone: "success",
        title:
          res.status === "ACCEPTED"
            ? `You are now friends with @${u.username}`
            : `Friend request sent to @${u.username}`,
      });
      await load();
    } catch (e) {
      toast({
        tone: "error",
        title: "Request failed",
        body: e instanceof ApiError ? e.message : undefined,
      });
    }
  };

  const accept = async (friendshipId: string) => {
    await FriendsAPI.accept(friendshipId);
    await load();
  };

  const remove = async (friendId: string) => {
    await FriendsAPI.remove(friendId);
    if (me?.rivalId === friendId) {
      const { user } = await UsersAPI.updateMe({ rivalId: null });
      setUser(user);
    }
    await load();
    toast({ tone: "info", title: "Friend removed" });
  };

  const setRival = async (friendId: string | null) => {
    const { user } = await UsersAPI.updateMe({ rivalId: friendId });
    setUser(user);
    await refresh();
    toast({
      tone: "success",
      title: friendId ? "Rival set" : "Rival cleared",
    });
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Friends</h1>
        <p className="text-sm text-slate-400">
          Add rivals. Compare stats. Create bragging rights.
        </p>
      </header>

      <section className="card p-5">
        <label className="mb-1 block text-xs font-medium text-slate-400">
          Search users
        </label>
        <input
          className="input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by username, display name, or LeetCode handle"
        />
        {query.trim().length >= 2 && (
          <div className="mt-3 space-y-2">
            {searching ? (
              <div className="flex justify-center py-4">
                <Spinner size={18} />
              </div>
            ) : searchResults.length === 0 ? (
              <p className="py-2 text-sm text-slate-400">No users found.</p>
            ) : (
              searchResults.map((u) => (
                <div
                  key={u.id}
                  className="flex items-center gap-3 rounded-xl border border-ink-700 bg-ink-800/60 p-2"
                >
                  <Avatar url={u.avatarUrl} name={u.displayName} size={36} />
                  <div className="min-w-0 flex-1">
                    <Link
                      to={`/app/profile/${u.username}`}
                      className="truncate text-sm font-semibold hover:text-brand-400"
                    >
                      {u.displayName}
                    </Link>
                    <div className="text-xs text-slate-400">
                      @{u.username} · Lv {u.level} · {fmt(u.xp)} XP
                    </div>
                  </div>
                  <button
                    onClick={() => request(u)}
                    className="btn-primary"
                  >
                    Add friend
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </section>

      {loading || !data ? (
        <div className="flex justify-center py-8">
          <Spinner size={20} />
        </div>
      ) : (
        <>
          {data.incoming.length > 0 && (
            <section className="card p-5">
              <h2 className="font-bold">
                Incoming requests ({data.incoming.length})
              </h2>
              <ul className="mt-3 space-y-2">
                {data.incoming.map((r) => (
                  <li
                    key={r.id}
                    className="flex items-center gap-3 rounded-xl border border-ink-700 bg-ink-800/60 p-2"
                  >
                    <Avatar
                      url={r.from.avatarUrl}
                      name={r.from.displayName}
                      size={36}
                    />
                    <div className="min-w-0 flex-1">
                      <Link
                        to={`/app/profile/${r.from.username}`}
                        className="truncate text-sm font-semibold hover:text-brand-400"
                      >
                        {r.from.displayName}
                      </Link>
                      <div className="text-xs text-slate-400">
                        @{r.from.username}
                      </div>
                    </div>
                    <button onClick={() => accept(r.id)} className="btn-primary">
                      Accept
                    </button>
                    <button
                      onClick={() => remove(r.from.id)}
                      className="btn-ghost"
                    >
                      Ignore
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="card p-5">
            <h2 className="font-bold">
              Friends ({data.friends.length})
            </h2>
            {data.friends.length === 0 ? (
              <EmptyState
                title="No friends yet"
                description="Search above to add your first rival."
                icon={<IconUsers size={30} className="text-brand-300" />}
              />
            ) : (
              <ul className="mt-3 grid gap-2 md:grid-cols-2">
                {data.friends.map((f) => {
                  const isRival = me?.rivalId === f.id;
                  return (
                    <li
                      key={f.id}
                      className={`flex items-center gap-3 rounded-xl border p-3 ${
                        isRival
                          ? "border-brand/40 bg-brand/10"
                          : "border-ink-700 bg-ink-800/60"
                      }`}
                    >
                      <Avatar
                        url={f.avatarUrl}
                        name={f.displayName}
                        size={40}
                      />
                      <div className="min-w-0 flex-1">
                        <Link
                          to={`/app/profile/${f.username}`}
                          className="truncate text-sm font-semibold hover:text-brand-400"
                        >
                          {f.displayName}
                        </Link>
                        <div className="text-xs text-slate-400">
                          @{f.username} · Lv {f.level} · {fmt(f.xp)} XP
                        </div>
                      </div>
                      <button
                        title={isRival ? "Clear rival" : "Set as rival"}
                        onClick={() => setRival(isRival ? null : f.id)}
                        className={`inline-flex items-center gap-1.5 ${
                          isRival ? "btn-primary" : "btn-secondary"
                        }`}
                      >
                        {isRival && <IconFlame size={14} />}
                        Rival
                      </button>
                      <button
                        onClick={() => remove(f.id)}
                        className="btn-ghost"
                        title="Remove friend"
                      >
                        ×
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          {data.outgoing.length > 0 && (
            <section className="card p-5">
              <h2 className="font-bold">
                Outgoing requests ({data.outgoing.length})
              </h2>
              <ul className="mt-3 space-y-2">
                {data.outgoing.map((r) => (
                  <li
                    key={r.id}
                    className="flex items-center gap-3 rounded-xl border border-ink-700 bg-ink-800/40 p-2"
                  >
                    <Avatar url={r.to.avatarUrl} name={r.to.displayName} size={32} />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold">
                        {r.to.displayName}
                      </div>
                      <div className="text-xs text-slate-400">
                        @{r.to.username} · pending
                      </div>
                    </div>
                    <button
                      onClick={() => remove(r.to.id)}
                      className="btn-ghost"
                    >
                      Cancel
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </div>
  );
}
