import { db } from "../server/db";
import kalasangamaError from "./customError";
import type { UserInput } from "~/utils/CustomTypes";

const getUserAccessToTeam = async (user_id: string) => {
	const user = await db.user.findUnique({
		where: { id: user_id },
		select: {
			LeaderOf: {
				select: {
					id: true,
					name: true,
				}
			},
		},
	});
	if (user?.LeaderOf?.id) {
		return "LEADER";
	} else if (user?.LeaderOf?.id) {
		return "MEMBER";
	} else {
		return "NEW_USER";
	}
};
const getCollegeById = async (college_id: string) => {
	const college = await db.college.findUnique({
		where: {
			id: college_id,
		},
		include: { Team: {
			include: { TeamMembers: true},
		} },
	});

	if (!college) {
		throw new kalasangamaError("Create team error", "College not found");
	}
	return college;
};

const setLeader = async (
	user_id: string,
	teamName: string,
	character_id: string | null,
) => {
	if (character_id)
		await db.user.update({
			where: { id: user_id },
			data: {
				LeaderOf: {
					connect: {
						name: teamName,
					},
				},
			},
		});
	else
		await db.user.update({
			where: { id: user_id },
			data: {
				LeaderOf: {
					connect: {
						name: teamName,
					},
				},
			},
		});
};

const createAccount = (
	user: UserInput,
	teamName: string,
) => {
	return db.teamMembers.create({
		data: {
			name: user?.name ?? "",
			Character: {
				connect: {
					id: user?.characterId,
				},
			},
			idURL: user?.idURL ?? "",
			Team: {
				connect: {
					name: teamName,
				},
			},
		},
	});
};

const setTeamCompleteStatus = async (team_id: string, status: boolean) => {
	await db.team.update({
		where: { id: team_id },
		data: { isComplete: status },
	});
};
export {
	getCollegeById,
	setLeader,
	getUserAccessToTeam,
	createAccount,
	setTeamCompleteStatus,
};
