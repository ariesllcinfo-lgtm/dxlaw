#!/usr/bin/env python3
"""Toy reachability experiment: legal correction versus effective relief.

Model assumptions (NOT observed Japanese administrative processing times):
- Directed edges are lawful state transitions for a hypothetical scheme.
- Edge weights are fictional processing days.
- Operational failure may disable a lawful payment transition.
- The target 'relief' is an effective payment or independent monetary substitute.
Run with Python 3, no dependencies: python3 pilot.py
"""
from heapq import heappop, heappush

SERIAL = [
    ("error", "corrected_record", 2),
    ("corrected_record", "redetermined", 3),
    ("redetermined", "paid", 3),
    ("paid", "relief", 0),
]
INDEPENDENT = SERIAL + [
    ("error", "independent_review", 2),
    ("independent_review", "redetermined", 2),
]
ALTERNATIVE = INDEPENDENT + [
    ("error", "compensation_claim", 3),
    ("compensation_claim", "compensation_award", 5),
    ("compensation_award", "compensation_paid", 2),
    ("compensation_paid", "relief", 0),
]
SYSTEMS = {
    "serial": SERIAL,
    "independent_review": INDEPENDENT,
    "alternative_monetary_relief": ALTERNATIVE,
}
PAYMENT_FAILURE = {("redetermined", "paid")}


def shortest_path(edges, blocked=frozenset()):
    """Dijkstra search with nonnegative processing durations."""
    best = {"error": 0}
    prev = {}
    heap = [(0, "error")]
    while heap:
        cost, node = heappop(heap)
        if cost != best[node]:
            continue
        if node == "relief":
            trace = [node]
            while trace[-1] != "error":
                trace.append(prev[trace[-1]])
            return cost, list(reversed(trace))
        for source, dest, days in edges:
            if source == node and (source, dest) not in blocked:
                candidate = cost + days
                if candidate < best.get(dest, float("inf")):
                    best[dest] = candidate
                    prev[dest] = node
                    heappush(heap, (candidate, dest))
    return None, None


def run():
    expected = {
        "serial": (8, None),
        "independent_review": (7, None),
        "alternative_monetary_relief": (7, 10),
    }
    print("scheme,normal_days,payment_failure_days,normal_path,failure_path")
    for name, edges in SYSTEMS.items():
        normal_days, normal_path = shortest_path(edges)
        failed_days, failed_path = shortest_path(edges, PAYMENT_FAILURE)
        assert (normal_days, failed_days) == expected[name], name
        n_path = ">".join(normal_path or [])
        f_path = ">".join(failed_path or [])
        print(f"{name},{normal_days},{failed_days if failed_days is not None else 'unreachable'},{n_path},{f_path}")


if __name__ == "__main__":
    run()
