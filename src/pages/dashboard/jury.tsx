import { useSession } from "next-auth/react";
import { api } from "../../utils/api";
import {
  Table,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableHeader,
} from "~/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { ArrowDown } from "lucide-react";
import { useEffect, useState } from "react";
import { NextPage } from "next";
import Remarks from "~/components/Jury/remarks";
import Submit from "~/components/Jury/submit";
import { Criteria, Characters } from "@prisma/client";

const Jury: NextPage = () => {

  const criteriaList: Criteria[] = ["CRITERIA_1", "CRITERIA_2", "CRITERIA_3"];
  const criteriaDisplayList: string[] = ["Criteria 1", "Criteria 2", "Criteria 3"];

  type ScoresState = {
    [character in Characters]: {
      [criteria in Criteria]: number;
    };
  };

  type TeamScoresState = {
    [criteria in Criteria]: number
  }

  const [teamName, setTeamName] = useState<string>("Select a college");
  const [teamId, setTeamId] = useState<string>("");
  const [scored,setScored] = useState<boolean>(false);
  const [settingCriteria, setSettingCriteria] = useState<Criteria>("CRITERIA_1");
  const [settingCharacter, setSettingCharacter] = useState<Characters>("DAASHARAJA");
  const [settingCriteriaScore, setSettingCriteriaScore] = useState<Criteria>("CRITERIA_1");

  const scoreUpdate = api.jury.updateScores.useMutation();
  const criteriaTotal = api.jury.updateCriteriaScore.useMutation();
  const { data, isLoading } = api.jury.getTeams.useQuery();

  const characters : Characters[] = [
    "SHANTHANU",
    "MANTRI_SUNEETHI",
    "TAMAALAKETHU",
    "TAAMRAAKSHA",
    "SATHYAVATHI",
    "DAASHARAJA",
    "DEVAVRATHA",
  ];

  // Initialize scores with all values set to 0
  const initialScores: ScoresState = {} as ScoresState;
  const criteriaScores: TeamScoresState = {} as TeamScoresState;

  characters.forEach((character) => {
    initialScores[character] = {} as ScoresState[Characters];

    criteriaList.forEach((criteria) => {
      initialScores[character][criteria] = 0;
    });
  });

  criteriaList.forEach((criteria) => {
    criteriaScores[criteria] = 0;
  });

  const [scores, setScores] = useState<ScoresState>(initialScores);
  const [cScores, setCScores] = useState<TeamScoresState>(criteriaScores);
  const [ready, setReady] = useState<boolean>(false);
  const [ready2, setReady2] = useState<boolean>(false);

    const handleScoreChange = (
      character: Characters,
      criteria: Criteria,
      value: number
    ) => {
      setSettingCharacter(character)
      setSettingCriteria(criteria)
      // Update the scores state with the new value
      setScores((prevScores) => ({
        ...prevScores,
        [character]: {
          ...prevScores[character],
          [criteria]: value,
        },
      }));
      scoreUpdate.mutate({
        teamId: teamId,
        criteriaName: criteria,
        characterId: character,
        score: value,
      });
    };

    const totalScore = (character: string) => {
      if (scores[character] != null) {
        const keys = Object.keys(scores[character]);
        let sum = 0;
        keys.forEach((key) => {
          sum += scores[character][key];
        });
        return sum;
      }
      return 0;
    };

    const handleCriteriaScoreChange = (value: number, criteria: Criteria) => {
        setSettingCriteriaScore(criteria);
        setCScores((prevScores) => ({
          ...prevScores,
          [criteria]: value
        }))
        console.log(value)
        console.log(criteria)
        criteriaTotal.mutate({
          criteriaName: criteria,
          score: value,
          teamId: teamId
        })
    }

    const calculateFinalTotal = (): number => {
      let sum=0;
      Object.keys(cScores).forEach((key) => {
        sum+=cScores[key]
      });
      return sum
    };

    const res = api.jury.getScores.useQuery({
      teamId: teamId,
    },
    {
      onError: (error) => {
        console.error(error);
        alert("Error fetching score");
      },
    })

    const setTeam = (teamId:string ,teamName:string,isScored:boolean) => {
      setReady(false);
      if(isScored)
        setScored(true);
      else
        setScored(false)
      setTeamId(teamId);
      setTeamName(teamName);
    }

    useEffect(() => {
      res.refetch()
    },[teamId])

    useEffect(() => {
      if(res.data?.length>0){
        console.log("updating")
          res.data.forEach((item) => {
            const character = item.characterPlayed.character;
            const criteria = item.criteria.name;
            // Update the scores state with the new value
            setScores((prevScores) => ({
              ...prevScores,
              [character]: {
                ...prevScores[character],
                [criteria]: item.score,
              },
            }));
          });
          setReady(true);
      }
      if(!ready2)
        setReady2(true);
      else
        setReady(true);
    },[res.data])

    return !isLoading && data!==undefined && data.length>0 ? (
      <div className="container md:pt-20 pt-14 flex flex-col w-full">
        <h1 className="text-extrabold mt-10 text-4xl pb-2">
          Judge Dashboard - {teamName}
        </h1>
        <div className="flex md:flex-row flex-col w-full m-2 text-center">
          <div className="flex basis-1/2 justify-start">
            <DropdownMenu>
              <DropdownMenuTrigger className="flex flex-row gap-3 border border-white rounded-lg p-2 text-center items-center">
                <div className="md:text-xl text-2xl">Select a team</div>
                <ArrowDown></ArrowDown>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {!isLoading ? (
                  data?.map((team ,i) => (
                    <DropdownMenuItem className="text-xl" key={team.id} onSelect={e => setTeam(team.id, team.name, team.isScored)}>
                      {team.name}
                    </DropdownMenuItem>
                  ))
                ) : (
                  <DropdownMenuItem className="text-xl">No teams</DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <Remarks
            teamId={teamId}
            isLoading={scoreUpdate.isLoading}
          />
        </div>
        {teamName !=="Select a college" && !scored && ready ? (
        <div className="flex flex-col md:flex-row gap-6">
          <div className="basis-4/5">
            <Table>
              <TableHeader className="invisible md:visible">
                <TableRow className="text-xl">
                  <TableHead>Character</TableHead>
                  {criteriaDisplayList.map((criteria, i) => (
                    <TableHead key={i}>{criteria}</TableHead>
                  ))}
                  <TableHead>Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="text-xl">
                {characters.map((character, i) => (
                  <TableRow key={i} className="">
                    <TableCell className="md:m-0">{character}</TableCell>
                    {criteriaList.map((criteria, j) => (
                      <TableCell key={j}>
                        <input
                          value={scores[character]?.[criteria] || 0}
                          onChange={(e) =>
                            handleScoreChange(
                              character,
                              criteria,
                              parseInt(e.target.value, 10) || 0
                            )
                          }
                          className={`outline-none  bg-transparent border-2 text-center w-24 rounded-lg ${scoreUpdate.isLoading && settingCriteria===criteria && settingCharacter===character ? `border-red-800`:`border-green-800`}`}
                        />
                      </TableCell>
                    ))}
                    <TableCell>{totalScore(character)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="basis-1/5">
            <Table className="flex flex-col text-2xl">
              <TableHeader>
                <TableRow className="text-2xl">
                  <TableHead>Team Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {criteriaDisplayList.map((criteria, k) => (
                  <TableRow key={k}>
                    <TableCell>{criteria}</TableCell>
                    <TableCell>
                    <input
                          value={cScores[criteriaList[k]]}
                          onChange={(e) => handleCriteriaScoreChange(
                            parseInt(e.target.value, 10) || 0, 
                            criteriaList[k])
                          }
                          className={`outline-none  bg-transparent border-2 text-center w-24 rounded-lg ${criteriaTotal.isLoading && settingCriteriaScore===criteriaList[k] ? `border-red-800`:`border-green-800`}`}
                        />
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell>Total</TableCell>
                  <TableCell>{calculateFinalTotal()}</TableCell>
                </TableRow>
                <Submit
                  scores = {scores}
                  teamId = {teamId}
                  teamName = {teamName}
                  criteriaDisplayList = {criteriaDisplayList}
                  criteriaList = {criteriaList}
                  characters = {characters}
                  scored = {scored}
                  setScored = {setScored}
                />
              </TableBody>
            </Table>
          </div>
        </div>
        ):
        scored ? (
              <div className="container py-40">
                <div className="w-full h-full">
                    <div className="flex text-2xl justify-center text-center ">Thank you for Judging... you can select any other team</div>
                </div>
            </div>
            )
            :
            !ready && teamName ==="Select a college" && !scored ? (
              <><div className="text-2xl flex justify-center text-center p-4 m-4">Please select a college....</div></>
            )
          :
        (
        <><div className="text-2xl flex justify-center text-center p-4 m-4">Loading Scores....</div></>
      )
    }
      </div>
    ) : (
      <div className="container py-40">
          <div className="w-full h-full">
              <div className="flex text-2xl justify-center text-center ">{isLoading ?"Loading...":"No teams to judge at the moment...."}</div>
          </div>
      </div>
    );
  };

export default Jury;
