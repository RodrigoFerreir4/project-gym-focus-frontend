"use client";

import { BottomBar } from "@/components/bottom-bar";
import { Logo } from "@/components/logo";
import { showToast } from "@/libs/toastify";
import { getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import * as yup from "yup";

interface ExerciseInfoProps {
  id: string;
  name: string;
  grouping: string;
}

export default function CreateWorkout() {
  const [amountOfRepetitions, setAmountOfRepetitions] = useState("");
  const [amountOfSeries, setAmountOfSeries] = useState("");
  const [weight, setWeight] = useState("");
  const [exercise, setExercise] = useState("");
  const [exerciseInfo, setExerciseInfo] = useState<ExerciseInfoProps[] | null>(
    null
  );
  const [selectedExercise, setSelectedExercise] =
    useState<ExerciseInfoProps | null>(null);
  const [division, setDivision] = useState("");
  const [showExerciseDropdown, setShowExerciseDropdown] = useState(false);
  const [showDivisionDropdown, setShowDivisionDropdown] = useState(false);
  const router = useRouter();

  const validationSchema = yup.object().shape({
    amountOfRepetitions: yup
      .number()
      .typeError("A quantidade de repetições deve ser um número")
      .integer("A quantidade de repetições deve ser um número inteiro")
      .min(1, "A quantidade de repetições deve ser no mínimo 1")
      .required("A quantidade de repetições é obrigatória"),

    amountOfSeries: yup
      .number()
      .typeError("A quantidade de séries deve ser um número")
      .integer("A quantidade de séries deve ser um número inteiro")
      .min(1, "A quantidade de séries deve ser no mínimo 1")
      .required("A quantidade de séries é obrigatória"),

    weight: yup
      .number()
      .typeError("O peso deve ser um número")
      .min(1, "O peso deve ser no mínimo 1")
      .required("O peso é obrigatório"),
  });

  const translateErrorMessage = (
    originalMessages: string | string[]
  ): string | string[] => {
    const errorTranslations: { [key: string]: string } = {
      "Workout with the same exerciseInfoId and division already exists":
        "Este exercicio já existe na divisão selecionada",
    };
    if (Array.isArray(originalMessages)) {
      return originalMessages.map(
        (message) => errorTranslations[message] || message
      );
    } else {
      return errorTranslations[originalMessages] || originalMessages;
    }
  };

  const handleExerciseSelection = (exercise: ExerciseInfoProps | null) => {
    console.log(exercise);
    setSelectedExercise(exercise);
    setShowExerciseDropdown(false);
    setExercise(exercise?.name || "");
  };

  const handleDivisionSelection = (selectedDivision: string) => {
    setDivision(selectedDivision);
    setShowDivisionDropdown(false);
  };

  useEffect(() => {
    const fetchExerciseInfo = async () => {
      try {
        const session = await getSession();
        const token = session as any;

        const response = await fetch(
          `${process.env.API_URL}/workouts/find-exercise-info-by-name?name=${exercise}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token.data.access_token}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setExerciseInfo(data);
        } else {
          setExerciseInfo(null);
        }
      } catch (error) {
        console.error("Erro ao buscar informações do exercício:", error);
      }
    };

    if (exercise) {
      fetchExerciseInfo();
    }
  }, [exercise]);

  const handleSubmit = async () => {
    try {
      await validationSchema.validate(
        {
          amountOfRepetitions,
          amountOfSeries,
          weight,
          exerciseInfoId: selectedExercise?.id,
          division,
        },
        { abortEarly: false }
      );

      const session = await getSession();
      const token = session as any;

      const parsedRepetitions = parseInt(amountOfRepetitions, 10);
      const parsedSeries = parseInt(amountOfSeries, 10);
      const parsedWeight = parseInt(weight, 10);
      const response = await fetch(`${process.env.API_URL}/workouts/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.data.access_token}`,
        },
        body: JSON.stringify({
          amountOfRepetitions: parsedRepetitions,
          amountOfSeries: parsedSeries,
          weight: parsedWeight,
          exerciseInfoId: selectedExercise?.id,
          division: division,
        }),
      });

      if (response.ok) {
        showToast("Exercício adicionado com sucesso", "success");
      } else {
        const responseData = await response.json();
        const translatedMessage = translateErrorMessage(responseData.message);
        showToast(`${translatedMessage}`, "error");
      }
    } catch (error) {
      const validationErrors: Record<string, string> = {};

      if (error instanceof yup.ValidationError) {
        error.inner.forEach((e) => {
          const path = e.path || "nonFieldError";
          validationErrors[path] = e.message;
        });
      }
      const errorMessage = Object.values(validationErrors).join(", ");

      showToast(errorMessage, "error");
    }
  };
  const handleClick = () => {
    router.push("/");
  };
  return (
    <div>
      <button onClick={handleClick} className="w-full">
        <Logo variant="primary" />
      </button>
      <div className="flex justify-center">
        <form className="w-4/5 mt-40 ">
          <div className="flex -mx-3">
            <div className="w-full px-3">
              <label className="block uppercase tracking-wide text-gray-50 text-xs font-bold mb-2">
                Exercício
              </label>
              <input
                className="appearance-none block w-full bg-gray-1 text-gray-500 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-gray-2 focus:border-gray-500"
                id="exercise"
                type="text"
                value={exercise}
                onChange={(e) => setExercise(e.target.value)}
                onClick={() => setShowExerciseDropdown(true)}
              />
              {exerciseInfo && showExerciseDropdown && (
                <div className="max-w-lg max-h-24 overflow-x-auto scrollbar-thin scrollbar-thumb-sky-1 mb-4">
                  <ul className="list-none p-0 m-0">
                    {exerciseInfo.map((exercise, index) => (
                      <li
                        key={index}
                        className="flex items-center justify-between cursor-pointer text-gray-500 ml-3 hover:bg-gray-1"
                        onClick={() => handleExerciseSelection(exercise)}
                      >
                        {exercise.name}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
          <div className="flex -mx-3">
            <div className="w-full md:w-1/2 px-3 md:mb-0">
              <label className="block uppercase tracking-wide text-gray-50 text-xs font-bold mb-2 ">
                Séries
              </label>
              <input
                className="appearance-none block w-full bg-gray-1 text-gray-500 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-gray-2 text-center"
                id="amountOfSeries"
                type="text"
                value={amountOfSeries}
                onChange={(e) => setAmountOfSeries(e.target.value)}
              />
            </div>
            <div className="w-full md:w-1/2 px-3">
              <label className="block uppercase tracking-wide text-gray-50 text-xs font-bold mb-2">
                Repetições
              </label>
              <input
                className="appearance-none block w-full bg-gray-1 text-gray-500 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-gray-2 text-center"
                id="amountOfRepetitions"
                type="text"
                value={amountOfRepetitions}
                onChange={(e) => setAmountOfRepetitions(e.target.value)}
              />
            </div>
          </div>
          <div className="flex  -mx-3 mb-6">
            <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
              <label className="block uppercase tracking-wide text-gray-50 text-xs font-bold mb-2">
                Peso
              </label>
              <input
                className="appearance-none block w-full bg-gray-1 text-gray-500  rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-gray-2 text-center"
                id="weight"
                type="text"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
              />
            </div>

            <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
              <label className="block uppercase tracking-wide text-gray-50 text-xs font-bold mb-2">
                Divisão
              </label>
              <div className="relative">
                <input
                  className="w-full h-11 px-3 bg-gray-1 text-gray-500 rounded focus:outline-none focus:bg-gray-2 text-center appearance-none"
                  type="text"
                  value={division}
                  onChange={(e) => setDivision(e.target.value)}
                  onClick={() => setShowDivisionDropdown(true)}
                  readOnly
                />
                {showDivisionDropdown && (
                  <div className="absolute top-10 left-0 w-full max-h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-sky-1 bg-white border border-gray-300 rounded-md ">
                    <ul className="p-0 m-0">
                      {["A", "B", "C", "D", "E", "F", "G"].map(
                        (item, index) => (
                          <li
                            key={index}
                            className="cursor-pointer px-4 py-2 text-center border-transparent hover:bg-gray-100"
                            onClick={() => handleDivisionSelection(item)}
                          >
                            {item}
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>
      <div className="flex justify-center">
        <button
          className={
            "bg-sky-1 text-black-1 p-2 rounded-lg mt-1 w-4/5 h-14 items-center"
          }
          onClick={handleSubmit}
        >
          Salvar
          <ToastContainer />
        </button>
      </div>
      <BottomBar />
    </div>
  );
}
