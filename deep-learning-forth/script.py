# take the list.txt file and convert it to requirements.txt
import re

def main():
    content = ""
    output = []
    with open("list.txt", "r") as f:
        content = f.read()

    for line in content.replace("^M", "").split("\n"):
        line = re.sub(' +', " ", line)
        print(line)
        name, version = line.split(" ")[0], line.split(" ")[1]
        print(name, version)
        output.append(f"{name}=={version}")

    with open("requirements.txt", "w") as f:
        f.write("\n".join(output))

if __name__ == '__main__':
    main()

