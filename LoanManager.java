
import java.io.*;
import java.math.BigDecimal;
import java.util.*;

class Loan {
    String id, name, status;
    double amount;
    int priority;
    long order;

    Loan(String id, String name, double amount,
         int priority, String status, long order) {

        this.id = id;
        this.name = name;
        this.amount = amount;
        this.priority = priority;
        this.status = status;
        this.order = order;
    }

    public String toString() {
        return id + " | " + name + " | "
                + BigDecimal.valueOf(amount).stripTrailingZeros().toPlainString()
                + " | Priority: " + priority
                + " | Status: " + status;
    }
}


class LoanList {

    class Node {
        Loan data;
        Node next;

        Node(Loan data) {
            this.data = data;
            next = null;
        }
    }

    Node head, tail;

    void add(Loan loan) {

        Node newNode = new Node(loan);

        if (head == null) {
            head = newNode;
            tail = newNode;
        } else {
            tail.next = newNode;
            tail = newNode;
        }
    }

    void display() {

        if (head == null) {
            System.out.println("No applications found.");
            return;
        }

        Node temp = head;

        while (temp != null) {
            System.out.println(temp.data);
            temp = temp.next;
        }
    }
}


class BST {

    class Node {
        Loan data;
        Node left, right;

        Node(Loan data) {
            this.data = data;
        }
    }

    Node root;

    void insert(Loan loan) {
        root = add(root, loan);
    }

    Node add(Node root, Loan loan) {

        if (root == null) {
            return new Node(loan);
        }

        if (loan.amount < root.data.amount) {
            root.left = add(root.left, loan);
        } else {
            root.right = add(root.right, loan);
        }

        return root;
    }

    void inorder(Node root) {

        if (root == null) {
            return;
        }

        inorder(root.left);
        System.out.println(root.data);
        inorder(root.right);
    }

    void display() {

        if (root == null) {
            System.out.println("No applications found.");
        } else {
            System.out.println("\nApplications by loan amount:");
            inorder(root);
        }
    }
}

public class LoanManager {

    static String file = "loan_applications.txt";

    static LoanList list = new LoanList();
    static BST tree = new BST();


    static HashMap<String, Loan> map = new HashMap<>();

    
    static PriorityQueue<Loan> pq = new PriorityQueue<>((a, b) -> {

        if (a.priority != b.priority) {
            return Integer.compare(b.priority, a.priority);
        }

        return Long.compare(a.order, b.order);
    });

    static int id = 101;
    static long count = 1;

    static void submit(String name, double amount, int priority) {

        if (amount <= 0 || !Double.isFinite(amount)) {
            System.out.println("Loan amount must be positive.");
            return;
        }

        while (map.containsKey("L" + id)) {
            id++;
        }

        String appId = "L" + id++;

        Loan loan = new Loan(appId, name, amount,
                priority, "PENDING", count++);

        list.add(loan);
        map.put(appId, loan);
        pq.offer(loan);
        tree.insert(loan);

        System.out.println("Application received: "
                + appId + " | " + name + " | "
                + BigDecimal.valueOf(amount).stripTrailingZeros().toPlainString());
    }


    static void search(String appId) {

        Loan loan = map.get(appId);

        if (loan == null) {
            System.out.println("Application " + appId + " not found.");
        } else {
            System.out.println(loan);
        }
    }


    static void process() {

        Loan loan = pq.poll();

        if (loan == null) {
            System.out.println("No pending applications.");
            return;
        }

        loan.status = "PROCESSED";

        System.out.println("Processing "
                + loan.id + " | " + loan.name);
    }


    static void display() {

        System.out.println("\nAll Loan Applications:");
        list.display();
    }

 
    static void displayByAmount() {
        tree.display();
    }


    static void report() {

        if (map.isEmpty()) {
            System.out.println("No applications found.");
            return;
        }

        ArrayList<Loan> arr = new ArrayList<>(map.values());

        Collections.sort(arr, (a, b) -> {

            if (a.priority != b.priority) {
                return Integer.compare(b.priority, a.priority);
            }

            if (a.amount != b.amount) {
                return Double.compare(a.amount, b.amount);
            }

            return Long.compare(a.order, b.order);
        });

        System.out.println("\n----- LOAN REVIEW REPORT -----");

        for (Loan loan : arr) {
            System.out.println(loan);
        }
    }


    static void load() {

        File f = new File(file);

        if (!f.exists()) {
            return;
        }

        try (BufferedReader br = new BufferedReader(new FileReader(f))) {

            String line;

            while ((line = br.readLine()) != null) {

                String[] data = line.split("\\|", -1);

                if (data.length != 6) {
                    continue;
                }

                try {

                    String appId = data[0];
                    String name = data[1];
                    double amount = Double.parseDouble(data[2]);
                    int priority = Integer.parseInt(data[3]);
                    String status = data[4];
                    long order = Long.parseLong(data[5]);

                    if (!appId.matches("L\\d+") ||
                        name.isEmpty() || name.contains("|") ||
                        amount <= 0 || !Double.isFinite(amount) ||
                        order <= 0 || map.containsKey(appId) ||
                        (!status.equals("PENDING") &&
                         !status.equals("PROCESSED"))) {
                        continue;
                    }

                    Loan loan = new Loan(appId, name, amount,
                            priority, status, order);

                    list.add(loan);
                    map.put(appId, loan);
                    tree.insert(loan);

                    if (status.equals("PENDING")) {
                        pq.offer(loan);
                    }

                    try {
                        int num = Integer.parseInt(appId.substring(1));
                        if (num >= id && num < Integer.MAX_VALUE) {
                            id = num + 1;
                        }
                    } catch (NumberFormatException e) {
                    }

                    count = Math.max(count, order + 1);

                } catch (NumberFormatException e) {
                    System.out.println("Invalid record skipped.");
                }
            }

            System.out.println("Previous applications loaded successfully.");

        } catch (IOException e) {
            System.out.println("Error reading file.");
        }
    }

    
    static void save() {

        try (BufferedWriter bw = new BufferedWriter(new FileWriter(file))) {

            LoanList.Node temp = list.head;

            while (temp != null) {

                Loan loan = temp.data;

                bw.write(loan.id + "|" + loan.name + "|"
                        + loan.amount + "|" + loan.priority + "|"
                        + loan.status + "|" + loan.order);

                bw.newLine();

                temp = temp.next;
            }

            System.out.println("Data saved successfully.");

        } catch (IOException e) {
            System.out.println("Error saving file.");
        }
    }

    public static void main(String[] args) {

        Scanner sc = new Scanner(System.in);

        load();

        while (true) {

            System.out.println("\n===== LOAN EMI PRIORITY MANAGER =====");
            System.out.println("1. Submit Application");
            System.out.println("2. Search Application");
            System.out.println("3. Process Next Application");
            System.out.println("4. Display Applications");
            System.out.println("5. Generate Sorted Report");
            System.out.println("6. Display Applications by Amount");
            System.out.println("7. Exit");

            System.out.print("Enter choice: ");

            int choice;

            try {
                choice = sc.nextInt();
                sc.nextLine();
            } catch (InputMismatchException e) {
                System.out.println("Please enter a valid choice.");
                sc.nextLine();
                continue;
            }

            switch (choice) {

                case 1:

                    System.out.print("Enter applicant name: ");
                    String name = sc.nextLine().trim();

                    if (name.isEmpty() || name.contains("|")) {
                        System.out.println("Invalid name.");
                        break;
                    }

                    try {

                        System.out.print("Enter loan amount: ");
                        double amount = sc.nextDouble();

                        System.out.print("Enter priority: ");
                        int priority = sc.nextInt();
                        sc.nextLine();

                        submit(name, amount, priority);

                    } catch (InputMismatchException e) {
                        System.out.println("Invalid input.");
                        sc.nextLine();
                    }

                    break;

                case 2:

                    System.out.print("Enter application ID: ");
                    String appId = sc.nextLine().trim();

                    search(appId);
                    break;

                case 3:

                    process();
                    break;

                case 4:

                    display();
                    break;

                case 5:

                    report();
                    break;

                case 6:

                    displayByAmount();
                    break;

                case 7:

                    save();
                    System.out.println("Program closed.");
                    sc.close();
                    return;

                default:

                    System.out.println("Invalid choice.");
            }
        }
    }
}
