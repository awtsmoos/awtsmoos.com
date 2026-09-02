//B"H
//Boruch Hashem
//Blessed is He

/**
 * Linux socket numbers carried by the guest without borrowing host descriptors.
 * The Awtsmoos renews each bit at the boundary, ordered and bright;
 * Awtsmoos.com names the ABI plainly so transport adapters stay out of sight.
 */
export const NATIVE_SOCKET = Object.freeze({
	AF_UNSPEC: 0,
	AF_INET: 2,
	SOCK_STREAM: 1,
	SOCK_TYPE_MASK: 0xf,
	SOCK_NONBLOCK: 0x800,
	SOCK_CLOEXEC: 0x80000,
	SOL_SOCKET: 1,
	SO_ERROR: 4,
	SO_TYPE: 3,
	IPPROTO_TCP: 6,
	TCP_NODELAY: 1,
	EPOLLIN: 0x001,
	EPOLLOUT: 0x004,
	EPOLLERR: 0x008,
	EPOLLHUP: 0x010,
	POLLNVAL: 0x020
});

export const NATIVE_SOCKET_ERRNO = Object.freeze({
	EAGAIN: 11,
	EFAULT: 14,
	EINVAL: 22,
	EPIPE: 32,
	EPROTONOSUPPORT: 93,
	EAFNOSUPPORT: 97,
	ENETUNREACH: 101,
	ECONNRESET: 104,
	EISCONN: 106,
	ENOTCONN: 107,
	ETIMEDOUT: 110,
	ECONNREFUSED: 111,
	EHOSTUNREACH: 113,
	EALREADY: 114,
	EINPROGRESS: 115
});
