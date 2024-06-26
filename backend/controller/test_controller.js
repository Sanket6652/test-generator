import func from "@hapi/joi";
import Tests from "../model/test_model.js";
import User from "../model/user_model.js";

export const testCreate = async (req, res) => {
  try {
    const {
      title,
      highestMarks,
      passingScore,
      domain,
      questions,
      availableAt,
      createdBy,
      testDuration,
    } = req.body;

    // Create the test
    const test = await Tests.create({
      title,
      highestMarks,
      passingScore,
      domain,
      questions,
      availableAt,
      createdBy,
      testDuration,
      released: false,
    });

    res.status(201).json({ message: "Test created succesfully" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getTests = async (req, res) => {
  try {
    const tests = await Tests.find().populate("questions"); // Only fetch tests that are available
    res.status(200).json({ tests });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};
export const getTestDomainwise = async (req, res) => {
  try {
    const tests = await Tests.find();

    if (tests.length === 0) {
      return res.status(404).json({ message: "No tests found" });
    }

    // Group tests by domain
    const testsByDomain = tests.reduce((acc, test) => {
      if (!acc[test.domain]) {
        acc[test.domain] = [];
      }
      acc[test.domain].push(test);
      return acc;
    }, {});

    // Sort domains
    const sortedDomains = Object.keys(testsByDomain).sort();

    // Construct response object
    const response = sortedDomains.map((domain) => ({
      domain,
      tests: testsByDomain[domain],
    }));

    res.json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const gettestByid = async (req, res) => {
  try {
    const { testId } = req.params;
    const test = await Tests.findById(testId);
    if (!test) {
      return res.status(404).json({ message: "Test not found" });
    }
    res.json({ test });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

///update test using id

export const updateTest = async (req, res) => {
  const { id } = req.params;
  try {
    const updatedTest = await Tests.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    if (!updatedTest) {
      return res.status(404).json({ message: "Test not found" });
    }
    console.log("success");
    return res.status(200).json(updatedTest);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
export const deleteTest = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedTest = await Tests.findByIdAndDelete(id);

    if (!deletedTest) {
      return res.status(404).json({ message: "Test not found" });
    }

    return res.status(200).json({ message: "Test deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

////submit answer

export const submitAnswers = async (req, res) => {
  try {
    const test = await Tests.findById(req.params.id);
    const testId = req.params.id;
    z;
    const answers = req.body.answers;
    const userId = req.body.userId;

    if (test.participants.includes(userId)) {
      return res
        .status(400)
        .json({ message: "already Submitted answer in this test" });
    }

    let score = 0;
    test.questions.forEach((question, index) => {
      if (question.answer === answers[index]) {
        score++;
      }
    });

    /*  add a field of type array in user modal "submittedTests:{ testId:_id, answers:answers }"
     *  submittedTests: [
              {
              testId: _id,
              answers,
              attemptedOnDate,
              attempted,
              wrongAnswers,
              marksEarned
              }
            ]
     *  add this user in array of participants in tests modal
     */

    test.participants.push(userId);
    await test.save();

    const user = await User.findById(userId);
    if (user) {
      user.completedTests.push(testId);
    }
    res.json({ score });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const releaseTest = async (req, res) => {
  const { id } = req.params;

  try {
    const releasedTest = await Tests.findByIdAndUpdate(
      id,
      {
        isReleased: true,
      },
      {
        new: true,
      }
    );

    if (!releasedTest) {
      return res.status(404).json({ message: "Test not found" });
    }
    console.log("success");
    return res.status(200).json(releasedTest);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
