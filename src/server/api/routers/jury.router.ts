import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { z } from "zod";
import kalasangamaError from "~/utils/customError";
import { get } from "http";

export const JuryRouter= createTRPCRouter({
		displayMembers : protectedProcedure
        .input(z.object({
            collegeId: z.string(),
        }))
        .query(async ({ctx,input})=>{
            const teamMembers = await ctx.prisma.team.findMany({
            where:{
                college_id: input.collegeId,
            },
            select:{
                members:{
                    select:{
                        id:true,
                        name:true,
                        characterPlayed:{
                            select:{
                                character:true,
                                playedBy:true,
                                score:true,
                            }
                        }
                    }
                },
                criteria:{
                    select:{
                        id:true,
                        name:true,
                    }
                },
            },
            })
            return teamMembers;
            }),


            getTeamScores: protectedProcedure
            .input(z.object({
                collegeId: z.string(),
            }))
            .query(async ({ctx,input})=>{
            const teamScores = await ctx.prisma.team.findUnique({
            where:{
                college_id: input.collegeId,
            },
            })
            return teamScores;
            }),

            getTeamCriteria: protectedProcedure
            .input(z.object({
                collegeId: z.string(),
            }))
            .query(async ({ctx,input})=>{
            const teamCriteria = await ctx.prisma.team.findUnique({
            where:{
                college_id: input.collegeId,
            },
            select:{
                criteria:{
                    select:{
                        id:true,
                        name:true,
                    }
                },
            }
            })
            teamCriteria.criteria.map((criteria)=>{
                criteria.id
            })
            return teamCriteria;
            }),


        })


        

